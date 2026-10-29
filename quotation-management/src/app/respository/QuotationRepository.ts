import { Op, Sequelize, Transaction, fn, col } from "sequelize";
import Quotation from "../models/Quotation";
import QuotationSupplier from "../models/QuotationSupplier";
import { generateQuotationId } from "../services/OrgSettingService";
import { resolveQuatationRelations } from "../services/QuotationGrpcService";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, subDays } from "date-fns";
import { getOrganizationById } from "../../grpc/clients/AdminGrpcClient";
import { lineItemSchema } from "../v1/validators/QuotationValidation";
import QuotationItem from "../models/QuotationItem";
import QuotationScoringConfiguration from "../models/QuotationScoringConfiguration";
import { calculateScore } from "../utils/general/ScoringUtils";
import QuotationItemScoringResult from "../models/QuotationItemScoringResult";
export const executeCreateRequisitionQuotation = async (
  data: any,
  user: any,
  token: string,
  transaction: Transaction
) => {
  const { attachments, suppliers, ...quotationData } = data;
  console.log("Quotation Data:", quotationData);

  const organization_id = user?.organization_id;
  const created_by = user?.id;
  const quote_id = await generateQuotationId(user.organization_id, token);

  const finalQuotationData = {
    ...quotationData,
    quote_id,
    organization_id,
    created_by,
    status: "pending_supplier_response",
  };

  const quotation = await Quotation.create(finalQuotationData, { transaction });

  // if (attachments?.length) {
  //   await QuotationAttachment.bulkCreate(
  //     attachments.map((file: any) => ({ ...file, quotation_id: quotation.id })),
  //     { transaction }
  //   );
  // }

  // Create suppliers within transaction
  if (suppliers?.length) {
    await QuotationSupplier.bulkCreate(
      suppliers.map((supplier: any) => ({
        ...supplier,
        quotation_id: quotation.id,
        organization_id: organization_id,
      })),
      { transaction }
    );
  }

  const updatedStatus = await http.put(
    `v1/requisition-status/${quotationData?.requisition_id}`,
    { status: "completed" },
    {
      token,
      baseURL: service.REQUISITION_SERVICE_URL,
    }
  );

  const response = {
    quotation,
    requisition_status: updatedStatus,
  };
  return {
    success: true,
    statusCode: 201,
    message: "RFQ created successfully.",
    data: response,
  };
};

// executeGetSupplierQuotations
export const executeGetSupplierQuotations = async (
  supplierId: any,
  user: any
) => {
  const quotations = await Quotation.findAll({
    where: {
      organization_id: user.organization_id,
      [Op.or]: [
        // Case 1: supplier_status IS NULL AND quotation.status = 'pending_supplier_response'
        {
          [Op.and]: [
            Sequelize.literal(`"suppliers"."supplier_status" IS NULL`),
            {
              status: {
                [Op.in]: ["pending_supplier_response", "sent_received"],
              },
            },
          ],
        },
        // Case 2: supplier_status IS NOT NULL (quotation.status doesn't matter)
        Sequelize.literal(`"suppliers"."supplier_status" IS NOT NULL`),
      ],
    },
    include: [
      {
        model: QuotationSupplier,
        as: "suppliers",
        where: {
          supplier_id: supplierId,
          organization_id: user.organization_id,
        },
        required: true,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  const plainData = quotations.map((q) => q.get({ plain: true }));
  return {
    success: true,
    statusCode: 200,
    message: `Quotations fetched successfully.`,
    data: plainData,
  };
};

// get quotations
export const executeGetQuotations = async (requestData: any) => {
  const {
    page,
    limit,
    organization_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
    status,
    search,
  } = requestData;

  const whereCondition: any = {
    organization_id,
  };
  if (subsidiary_id) {
    whereCondition.subsidiary_id = subsidiary_id;
  }
  if (subsidiary_branch_id) {
    whereCondition.subsidiary_branch_id = subsidiary_branch_id;
  }
  if (branch_department_id) {
    whereCondition.branch_department_id = branch_department_id;
  }
  if (status) {
    if (Array.isArray(status)) {
      whereCondition.status = { [Op.in]: status };
    } else {
      whereCondition.status = status;
    }
  }
  if (search) {
    whereCondition[Op.or] = [
      { quote_id: { [Op.iLike]: `%${search}%` } },
      { requisition_title: { [Op.iLike]: `%${search}%` } },
    ];
  }
  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    const { rows: quotations, count: total } = await Quotation.findAndCountAll({
      where: whereCondition,
      offset,
      limit: Number(limit),
      order: [["created_at", "DESC"]],
      raw: true,
    });

    const enrichedData = await Promise.all(
      quotations.map(resolveQuatationRelations)
    );

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    // RFQs Issued (Quotations created this month)
    const rfqsIssued = await Quotation.count({
      where: {
        organization_id: organization_id,
        created_at: { [Op.between]: [monthStart, monthEnd] },
      },
    });

    const bidsAwarded = await QuotationSupplier.count({
      where: {
        organization_id: organization_id,
        total_bid_amount: { [Op.ne]: null },
        created_at: { [Op.between]: [monthStart, monthEnd] },
      },
    });

    // Current month range
    const currentStart = startOfMonth(new Date());
    const currentEnd = endOfMonth(new Date());

    // Last month range
    const lastStart = startOfMonth(subMonths(new Date(), 1));
    const lastEnd = endOfMonth(subMonths(new Date(), 1));

    // Helper to calculate trend
    const calculateTrend = (current: number, last: number) => {
      if (last === 0 && current === 0) return { percentage: 0, trend: "no_change" };
      if (last === 0) return { percentage: 100, trend: "up" };
      const change = ((current - last) / last) * 100;
      return { percentage: Math.abs(Number(change.toFixed(2))), trend: change > 0 ? "up" : change < 0 ? "down" : "no_change" };
    };

    // Current month counts
    const rfqsCurrent = await Quotation.count({ where: { organization_id, created_at: { [Op.between]: [currentStart, currentEnd] } } });
    const quotesReceivedCurrent = await Quotation.count({ where: { organization_id, status: "received", created_at: { [Op.between]: [currentStart, currentEnd] } } });
    const bidsAwardedCurrent = await QuotationSupplier.count({ where: { organization_id, total_bid_amount: { [Op.ne]: null }, created_at: { [Op.between]: [currentStart, currentEnd] } } });

    // Last month counts
    const rfqsLast = await Quotation.count({ where: { organization_id, created_at: { [Op.between]: [lastStart, lastEnd] } } });
    const quotesReceivedLast = await Quotation.count({ where: { organization_id, status: "received", created_at: { [Op.between]: [lastStart, lastEnd] } } });
    const bidsAwardedLast = await QuotationSupplier.count({ where: { organization_id, total_bid_amount: { [Op.ne]: null }, created_at: { [Op.between]: [lastStart, lastEnd] } } });

    // Summary with trend
    const summary = {
      rfqs_issued: rfqsCurrent,
      rfqs_issued_change: calculateTrend(rfqsCurrent, rfqsLast).percentage,
      rfqs_issued_trend: calculateTrend(rfqsCurrent, rfqsLast).trend,

      quotes_received: quotesReceivedCurrent,
      quotes_received_change: calculateTrend(quotesReceivedCurrent, quotesReceivedLast).percentage,
      quotes_received_trend: calculateTrend(quotesReceivedCurrent, quotesReceivedLast).trend,

      bid_awarded: bidsAwardedCurrent,
      bid_awarded_change: calculateTrend(bidsAwardedCurrent, bidsAwardedLast).percentage,
      bid_awarded_trend: calculateTrend(bidsAwardedCurrent, bidsAwardedLast).trend,
    };

    return {
      success: true,
      statusCode: 200,
      message: "Quotations Retrieved Successfully!",
      data: {
        data: enrichedData,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        summary,
      },
    };
  }
  const quotations = await Quotation.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    raw: true,
  });
  const enrichedData = await Promise.all(
    quotations.map(resolveQuatationRelations)
  );

  return {
    success: true,
    statusCode: 200,
    message: "Quotations Retrieved Successfully!",
    data: enrichedData,
  };
}

//executeaddsupplierquotation:
export const executeAddSupplierQuotation = async (
  payload: any,
  user: any,
  transaction: Transaction
) => {
  try {
    const { comments, attachments, item_suppliers, ...updatedPayload } =
      payload;
    const supplierId = user.id;
    const exsitingSupplierQuotation = await QuotationSupplier.findOne({
      where: {
        quotation_id: updatedPayload.quotation_id,
        supplier_id: supplierId,
        organization_id: updatedPayload.organization_id,
      },
    });
    if (!exsitingSupplierQuotation) {
      return {
        success: false,
        statusCode: 404,
        message: "Supplier Quotation not found",
      };
    }

    await exsitingSupplierQuotation.update(
      { ...updatedPayload }, // fields to update
      transaction
    );
    const supplierQuotationId = exsitingSupplierQuotation.id;
    if (item_suppliers && item_suppliers.length > 0) {
      const lineItemData = item_suppliers.map((item: any) => ({
        ...item,
        quotation_supplier_id: supplierQuotationId,
      }));
      // await QuotationLineItemSupplier.bulkCreate(lineItemData, {
      //   transaction,
      // });
    }

    let attachmentsSupplierData;
    if (attachments && attachments.length > 0) {
      const attachmentData = attachments.map((item: any) => ({
        quotation_supplier_id: supplierQuotationId,
        file_url: item.file_url,
        file_name: item.file_name, // ✅ rename to match DB field
        quotation_id: item.quotation_id, // if your model includes this
        requisition_id: item.requisition_id, // if used
      }));
      // attachmentsSupplierData = await QuotationSupplierAttachment.bulkCreate(
      //   attachmentData,
      //   {
      //     transaction,
      //   }
      // );
    }

    let commentsData;
    if (comments && comments.length > 0) {
      const commentData = comments.map((item: any) => ({
        ...item,
        comment_by: supplierId,
      }));
      // commentsData = await QuotationCommentSupplier.bulkCreate(commentData, {
      //   transaction,
      // });
    }

    await Quotation.update(
      { status: "received" },
      {
        where: { id: updatedPayload?.quotation_id },
        transaction,
      }
    );

    return {
      success: true,
      statusCode: 201,
      message: "Supplier Quotation created successfully",
      data: exsitingSupplierQuotation,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 404,
      message: error,
    };
  }
};

// Get Quotation Detail
export const executeGetQuotationDetail = async (
  id: string,
  token: string,
  user: any
) => {
  const quotationDetail = await Quotation.findOne({
    where: { id },
    include: [
      // {
      //   model: QuotationAttachment,
      //   as: "attachments",
      // },
      // {
      //   model: QuotationSupplier,
      //   as: "suppliers",
      //   include: [
      //     {
      //       model: QuotationSupplierAttachment,
      //       as: "quotation_supplier_attachments",
      //     },
      //     {
      //       model: QuotationLineItemSupplier,
      //       as: "quotation_line_item_suppliers",
      //     },
      //     {
      //       model: QuotationCommentSupplier,
      //       as: "quotation_comment_suppliers",
      //     },
      //   ],
      // },
    ],
  });

  if (!quotationDetail) {
    return {
      success: false,
      statusCode: 404,
      message: "Quotation not found",
    };
  }

  const reqResponse = await http.get(
    `v1/get-external-requisition/item/${quotationDetail?.requisition_id}`,
    undefined,
    {
      token,
      baseURL: service.REQUISITION_SERVICE_URL,
    }
  );

  const enriched = await resolveQuatationRelations(quotationDetail.toJSON());
  enriched.requisition = reqResponse?.data?.data;

  if (quotationDetail.selected_supplier_id) {
    const quotationSupplierDetail = await QuotationSupplier.findOne({
      where: {
        supplier_id: quotationDetail.selected_supplier_id,
        quotation_id: quotationDetail.id,
      },
      // include: [
      //   {
      //     model: QuotationSupplierAttachment,
      //     as: "quotation_supplier_attachments",
      //   },
      //   {
      //     model: QuotationLineItemSupplier,
      //     as: "quotation_line_item_suppliers",
      //   },
      // ],
    });
    enriched.supplier_data = quotationSupplierDetail;
  } else {
    enriched.supplier_data = null;
  }

  return {
    success: true,
    statusCode: 200,
    message: "Quotation data retrieved successfully",
    data: enriched,
  };
};

// executeSelectedSupplierQuotation
export const executeSelectedSupplierQuotation = async (
  quotationId: string,
  supplierId: string,
  organizationId: string
) => {
  try {
    const quotation = await Quotation.findOne({
      where: {
        id: quotationId,
        organization_id: organizationId,
      },
    });

    if (!quotation) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation not found",
      };
    }

    // Update the quotation instance directly
    quotation.selected_supplier_id = supplierId;
    quotation.status = "approved";
    await quotation.save();

    return {
      success: true,
      statusCode: 200,
      message: "Supplier quotation selected successfully",
      data: quotation,
    };
  } catch (error) {
    console.error("Error selecting supplier quotation:", error);
    return {
      success: false,
      statusCode: 500,
      message: "An error occurred while updating the quotation",
      error,
    };
  }
};

export const executeUpdateQuotationStatus = async (
  id: string,
  data: any,
  user: any,
  transaction?: Transaction
) => {
  try {
    const quotation = await Quotation.findOne({
      where: {
        id: id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    if (!quotation) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation not found.",
      };
    }

    const isVendor = user.user_type === "vendor";

    if (isVendor) {
      const supplierRecord = await QuotationSupplier.findOne({
        where: {
          quotation_id: id,
          supplier_id: user.id,
          organization_id: user.organization_id,
        },
        transaction,
      });

      if (!supplierRecord) {
        return {
          success: false,
          statusCode: 404,
          message: "QuotationSupplier record not found for vendor.",
        };
      }

      // Update QuotationSupplier status
      await supplierRecord.update(
        { supplier_status: data.status },
        { transaction }
      );

      if (data.status === "approved") {
        // Also update quotation.status to 'received'
        await quotation.update({ status: "received" }, { transaction });
      }

      return {
        success: true,
        statusCode: 200,
        message: `Quotation supplier status updated to '${data.status}'`,
        data: {
          quotation,
          supplier: supplierRecord,
        },
      };
    }
    // 4. Update the requisition
    await quotation.update(
      {
        status: data.status,
      },
      { transaction }
    );

    return {
      success: true,
      statusCode: 200,
      message: "Quotation status updated successfully.",
      data: quotation,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update quotation status.",
      error: err?.original?.message || err?.message,
    };
  }
};

// executeDeliveryStatusSupplierLineItem
export const executeStatusSupplierLineItem = async (
  id: string,
  delivery_status: "pending" | "shipped" | "delivered" | "delayed",
  quantity_delivered?: number,
  admin_receive?: number,
  admin_rejected?: number,
  rejection_message?: string
) => {
  try {
    // const quotationLineItem = await QuotationLineItemSupplier.findOne({
    //   where: { id: id },
    // });

    // if (!quotationLineItem) {
    //   return {
    //     success: false,
    //     statusCode: 404,
    //     message: "Quotation Line Item not found",
    //   };
    // }

    // // Update the quotation instance directly
    // await quotationLineItem.update({
    //   delivery_status,
    // });
    // await QuotationLineItemDeliveryStatus.create({
    //   quotation_line_item_supplier_id: quotationLineItem.id,
    //   delivery_status: delivery_status,
    //   quantity_delivered: quantity_delivered,
    //   admin_receive: admin_receive,
    //   admin_rejected: admin_rejected,
    //   rejection_message: rejection_message,
    // });
    return {
      success: true,
      statusCode: 200,
      message: "Data updated successfully",
      // data: quotationLineItem,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "An error occurred while updating the data",
      error,
    };
  }
};

// executeAdminSupplierLineItem
export const executeAdminSupplierLineItem = async (items: any[]) => {
  try {
    const updatedItems = [];

    for (const item of items) {
      const {
        id,
        delivery_status,
        admin_receive,
        admin_rejected,
        rejection_message,
      } = item;

      // const quotationLineItem = await QuotationLineItemSupplier.findOne({
      //   where: { id },
      // });

      // if (!quotationLineItem) continue;

      // Update latest delivery_status
      // await quotationLineItem.update({ delivery_status });

      // // Save delivery history
      // const history = await QuotationLineItemDeliveryStatus.create({
      //   quotation_line_item_supplier_id: quotationLineItem.id,
      //   delivery_status,
      //   admin_receive,
      //   admin_rejected,
      //   rejection_message,
      // });

      updatedItems.push({
        item_id: id,
        current_status: delivery_status,
        // history_id: history.id,
      });
    }

    return {
      success: true,
      statusCode: 200,
      message: "All records processed",
      data: updatedItems,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: "An error occurred while updating data",
      error,
    };
  }
};

export const executeGetQuotationOrderDetail = async (
  supplier_id: string,
  quotation_id: string
) => {
  const quotationSupplierDetail = await QuotationSupplier.findOne({
    where: { supplier_id: supplier_id, quotation_id: quotation_id },
    // include: [
    //   {
    //     model: QuotationSupplierAttachment,
    //     as: "quotation_supplier_attachments",
    //   },
    //   {
    //     model: QuotationLineItemSupplier,
    //     as: "quotation_line_item_suppliers",
    //   },
    //   {
    //     model: QuotationCommentSupplier,
    //     as: "quotation_comment_suppliers",
    //   },
    // ],
  });

  if (!quotationSupplierDetail) {
    return {
      success: false,
      statusCode: 404,
      message: "Quotation Supplier not found",
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Quotation Supplier data retrieved successfully",
    data: quotationSupplierDetail,
  };
};

// ========================================= vendor api function ======================================

// Get quotation by supplier id
export const executeGetSupplierQuotation = async (
  supplierId: string,
  filters: any
) => {
  const {
    search,
    category,
    status,
    date_filter,
    from_date,
    to_date,
    page = 1,
    limit = 10,
  } = filters;

  const whereCondition: any = {
    supplier_id: supplierId,
  };

  if (status) {
    whereCondition.supplier_status = status;
  }

  if (category) {
    whereCondition[Op.and] = [
      Sequelize.literal(`
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements("QuotationSupplier"."line_items") AS item
        WHERE item->>'org_category_id' = '${category}'
      )
    `),
    ];
  }

  if (date_filter) {
    let startDate;
    let endDate = new Date();

    switch (date_filter) {
      case "today":
        startDate = startOfDay(new Date());
        endDate = endOfDay(new Date());
        break;

      case "last_7_days":
        startDate = subDays(new Date(), 7);
        break;

      case "last_30_days":
        startDate = subDays(new Date(), 30);
        break;

      case "last_3_months":
        startDate = subMonths(new Date(), 3);
        break;

      case "last_6_months":
        startDate = subMonths(new Date(), 6);
        break;

      case "last_12_months":
        startDate = subMonths(new Date(), 12);
        break;

      case "custom":
        if (from_date && to_date) {
          startDate = new Date(from_date as string);
          endDate = new Date(to_date as string);
        }
        break;
    }

    if (startDate && endDate) {
      whereCondition.created_at = {
        [Op.between]: [startDate, endDate],
      };
    }
  }

  // Pagination
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const offset = (pageNumber - 1) * limitNumber;

  const { rows: quotations, count: total } =
    await QuotationSupplier.findAndCountAll({
      where: whereCondition,

      include: [
        {
          model: Quotation,
          as: "quotation",
          ...(search && {
            where: {
              requisition_title: {
                [Op.iLike]: `%${search}%`,
              },
            },
          }),
        },
      ],

      offset,
      limit: limitNumber,
      order: [["created_at", "DESC"]],
    });

  // Organization Data
  const quotationsWithOrganization = await Promise.all(
    quotations.map(async (q: any) => {
      let organizationData = null;

      if (q.organization_id) {
        try {
          organizationData = await getOrganizationById(
            q.organization_id.toString()
          );
        } catch (err) {
          console.error("Error fetching organization via gRPC:", err);
        }
      }

      return {
        ...q.toJSON(),
        organization: organizationData,
      };
    })
  );

  // Status Summary
  const statusSummaryWhere: any = {
    supplier_id: supplierId,
  };

  if (date_filter) {
    statusSummaryWhere.created_at = whereCondition.created_at;
  }

  const statusCountsRaw = (await QuotationSupplier.findAll({
    where: statusSummaryWhere,
    attributes: [
      "supplier_status",
      [fn("COUNT", col("supplier_status")), "count"],
    ],
    group: ["supplier_status"],
    raw: true,
  })) as unknown as Array<{
    supplier_status: string | null;
    count: string | number;
  }>;

  const counts: Record<
    "pending_response" | "sent" | "in_revision" | "approved" | "rejected",
    number
  > = {
    pending_response: 0,
    sent: 0,
    in_revision: 0,
    approved: 0,
    rejected: 0,
  };

  statusCountsRaw.forEach((row) => {
    if (!row || !row.supplier_status) return;

    const key = row.supplier_status as keyof typeof counts;

    if (key in counts) {
      counts[key] = Number(row.count ?? 0);
    }
  });

  return {
    success: true,
    statusCode: 200,
    message: "Quotations fetched successfully",

    data: quotationsWithOrganization,

    pagination: {
      total,
      current_page: pageNumber,
      per_page: limitNumber,
      total_pages: Math.ceil(total / limitNumber),
    },

    status_summary: counts,
  };
};

// get all quotation
export const executeGetAllQuotations = async () => {
  try {
    const quotations = await Quotation.findAll(); // Adjust model name if needed
    return {
      success: true,
      statusCode: 200,
      message: "All quotations fetched successfully",
      data: quotations,
    };
  } catch (err) {
    console.error("Error fetching all quotations:", err);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch quotations",
      error: err,
    };
  }
};

// ✅ Get quotation by id
export const getQuotationByIdServices = async (quotationId: string) => {
  try {
    const quotation = await Quotation.findByPk(quotationId);

    if (!quotation) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation not found",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: quotation,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while fetching quotation.",
      error: error.message || error,
    };
  }
};

// ✅ Update quotation_suppliers table
export const updateQuotationSuppliers = async (
  quotationId: string,
  payload: {
    supplier_delivery_date?: string;
    warranty?: string;
    total_supplier_amount?: number;
    attachments?: any;
    line_items?: any;
    supplier_status?: string;
    comments?: string;
  }
) => {
  try {
    const updatePayload: any = { ...payload };

    // 🔹 Validate line_items if present
    if (payload.line_items) {
      const { error, value } = lineItemSchema.validate(payload.line_items);
      if (error) {
        return {
          success: false,
          statusCode: 400,
          message: `Invalid line_items: ${error.details[0].message}`,
        };
      }
      updatePayload.line_items = value; // sanitized data
    }
    // 🔹 Convert date string into Date object
    if (payload.supplier_delivery_date) {
      updatePayload.supplier_delivery_date = new Date(
        payload.supplier_delivery_date
      );
    }

    const [updatedCount, updatedRows] = await QuotationSupplier.update(
      updatePayload,
      {
        where: { quotation_id: quotationId },
        returning: true, // works in Postgres
      }
    );

    for (const lineItem of payload.line_items) {
      const quotationItem = await QuotationItem.findOne({
        where: { id: lineItem.quotation_item_id },
      });
      if (!quotationItem) continue;

      const scoringConfigs = await QuotationScoringConfiguration.findAll({
        where: { quotation_scoring_id: quotationItem.scoring_configuration_id },
      });

      for (const config of scoringConfigs) {
        const finalScore = calculateScore(config, quotationItem, lineItem);

        await QuotationItemScoringResult.create({
          quotation_item_id: quotationItem.id,
          quotation_supplier_id: updatedRows[0].id, // supplier ID
          scoring_configuration_id: config.id,
          score: finalScore / (config.weight || 1), // raw score
          weight: config.weight,
          final_score: finalScore,
        });
      }
    }

    if (updatedCount === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation supplier record not found",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: updatedRows[0] ?? null,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while updating quotation supplier.",
      error: error.message || error,
    };
  }
};

type QuotationStatus = Quotation["status"];
// ✅ Update quotations table status
export const updateQuotationStatesus = async (
  quotationId: string,
  status: QuotationStatus
) => {
  try {
    const [updatedCount, updatedRows] = await Quotation.update(
      { status },
      {
        where: { id: quotationId },
        returning: true, // again Postgres-specific; with MySQL fetch separately
      }
    );

    if (updatedCount === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation not found",
      };
    }

    return {
      success: true,
      statusCode: 200,
      data: updatedRows[0] ?? null,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while updating quotation status.",
      error: error.message || error,
    };
  }
};

// update vendor bid
export const updateSupplierBidService = async (
  quotationId: string,
  payload: {
    bid_status: "sent" | "withdrawn";
    bid_date_time: Date;
    total_bid_amount: number;
    comments: string;
  }
) => {
  try {
    const [updatedCount, updatedRows] = await QuotationSupplier.update(
      payload,
      {
        where: { quotation_id: quotationId },
        returning: true, // works in Postgres
      }
    );

    if (updatedCount === 0) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation supplier not found for given quotationId.",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Supplier bid updated successfully",
      data: updatedRows[0] ?? null,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while updating supplier bid.",
      error: error.message || error,
    };
  }
};

//summary
export const getQuotationBiddingSummaryService = async (
  quotationId: string,
  supplierId: string
) => {
  try {
    // 1️⃣ Get quotation details
    const quotation = await Quotation.findByPk(quotationId, {
      attributes: [
        "id",
        "total_quotation_amount",
        "bid_start_date",
        "bid_end_date",
        "bid_min_percent",
        "bid_max_percent",
      ],
    });

    if (!quotation) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation not found",
      };
    }

    // 2️⃣ Get suppliers data for this quotation
    const suppliers = await QuotationSupplier.findAll({
      where: { quotation_id: quotationId },
      attributes: [
        "supplier_id",
        "total_bid_amount",
        "bid_date_time",
        "bid_status",
        "organization_id",
      ],
      order: [["total_bid_amount", "DESC"]],
    });

    if (!suppliers.length) {
      return {
        success: true,
        statusCode: 200,
        message: "No supplier bids found for this quotation",
        data: {
          quotation,
          totalParticipants: 0,
          highestBid: null,
          rank: null,
          graphData: [],
          // organizationName: null,
        },
      };
    }

    // 3️⃣ Calculate participants count
    const totalParticipants = suppliers.filter(
      (s) => s.total_bid_amount && s.total_bid_amount > 0
    ).length;

    // 4️⃣ Find highest bid
    const highestBid = suppliers[0].total_bid_amount;

    // 5️⃣ Calculate rank of current supplier
    const sortedSuppliers = suppliers.map((s) => s.toJSON()); // convert to plain objects
    const supplierIndex = sortedSuppliers.findIndex(
      (s) => s.supplier_id === supplierId
    );
    const rank = supplierIndex !== -1 ? supplierIndex + 1 : null;

    // 6️⃣ Prepare graph data
    const graphData = sortedSuppliers.map((s, index) => ({
      anon_id: `ANON_${100 + index}`, // new anonymous ID
      total_bid_amount: s.total_bid_amount,
      bid_date_time: s.bid_date_time,
      bid_status: s.bid_status,
    }));

    // 7️⃣ Fetch organization name for this supplier
    // let organizationName: string | null = null;
    // if (supplierIndex !== -1) {
    //   const orgId = sortedSuppliers[supplierIndex].organization_id;
    //   if (orgId) {
    //     const org = await Organization.findByPk(orgId, {
    //       attributes: ["name"],
    //     });
    //     organizationName = org ? org.name : null;
    //   }
    // }

    return {
      success: true,
      statusCode: 200,
      message: "Bidding summary fetched successfully",
      data: {
        quotation,
        totalParticipants,
        highestBid,
        rank,
        graphData,
        // organizationName,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while fetching bidding summary.",
      error: error.message || error,
    };
  }
};

//update quotation status
export const updateQuotationStatusService = async (
  quotationId: string,
  status:
    | "pending_approval"
    | "supplier_approved"
    | "in_negotiation"
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected"
    | "draft"
) => {
  try {
    // 1️⃣ Find quotation
    const quotation = await Quotation.findByPk(quotationId);
    if (!quotation) {
      return {
        success: false,
        statusCode: 404,
        message: "Quotation not found",
      };
    }

    // 2️⃣ Update quotation status
    await quotation.update({ status });

    // 3️⃣ If status = "approved", also update suppliers
    if (status === "approved") {
      await QuotationSupplier.update(
        { supplier_status: "approved" },
        { where: { quotation_id: quotationId } }
      );
    }

    return {
      success: true,
      statusCode: 200,
      message: "Quotation status updated successfully",
      data: { quotation },
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while updating quotation status.",
      error: error.message || error,
    };
  }
};

// ============================== backoffice ========================
export const executeGetOrganizationQuotations = async (
  organization_id: string
) => {
  try {
    const quotations = await Quotation.findAll({
      where: { organization_id }, // filter by organization_id
    });

    return {
      success: true,
      statusCode: 200,
      message: "Quotations fetched successfully",
      data: quotations,
    };
  } catch (err) {
    console.error("Error fetching quotations:", err);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch quotations",
      error: err,
    };
  }
};
