import { Request, Response } from "express";
import AppDataSource from "../../../config/DatabaseSource";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import {
  addSupplierQuotationValidation,
  createQuotationSchema,
  createRequisitionQuotationValidation,
  getQuotationByIdSchema,
  getQuotationsValidation,
  updateNegotiationSchema,
  updateQuotationStatusValidation,
} from "../validators/QuotationValidation";
import {
  executeAddSupplierQuotation,
  executeAdminSupplierLineItem,
  executeCreateRequisitionQuotation,
  executeGetAllQuotations,
  executeGetOrganizationQuotations,
  executeGetQuotationDetail,
  executeGetQuotationOrderDetail,
  executeGetQuotations,
  executeGetSupplierQuotation,
  executeGetSupplierQuotations,
  executeSelectedSupplierQuotation,
  executeStatusSupplierLineItem,
  executeUpdateQuotationStatus,
  getQuotationBiddingSummaryService,
  getQuotationByIdServices,
  updateQuotationStatesus,
  updateQuotationStatusService,
  updateQuotationSuppliers,
  updateSupplierBidService,
} from "../../respository/QuotationRepository";
import Quotation from "../../models/Quotation";
import QuotationItem from "../../models/QuotationItem";
import QuotationSupplier from "../../models/QuotationSupplier";
import { generateQuotationId } from "../../services/OrgSettingService";
import { Op, Sequelize } from "sequelize";
import QuotationScoring from "../../models/QuotationScoring";
import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";
import QuotationScoringConfiguration from "../../models/QuotationScoringConfiguration";
import QuotationItemScoringResult from "../../models/QuotationItemScoringResult";
import { resolveQuatationRelations } from "../../services/QuotationGrpcService";
import QuotationNegotiation from "../../models/QuotationNegotiation";

// approvalBudget
// export const createRequisitionQuotation = async (
//   req: Request,
//   res: Response
// ) => {
//   const user = (req as any).user;
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!user?.id || !user?.organization_id || !token) {
//     errorResponse(res, {
//       message: "User authentication required",
//       statusCode: 401,
//     });
//     return;
//   }
//   const { error, value } = createRequisitionQuotationValidation.validate(
//     req.body
//   );
//   if (error) {
//     errorResponse(res, {
//       statusCode: 400,
//       message: error.details[0].message,
//     });
//     return;
//   }

//   const transaction = await AppDataSource.transaction();
//   try {
//     const result = await executeCreateRequisitionQuotation(
//       value,
//       user,
//       token,
//       transaction
//     );

//     if (!result.success) {
//       await transaction.rollback();
//       errorResponse(res, {
//         statusCode: result.statusCode,
//         message: result.message,
//       });
//       return;
//     }

//     await transaction.commit();
//     successResponse(res, {
//       statusCode: result.statusCode,
//       message: result.message,
//       data: result.data,
//     });
//   } catch (error: any) {
//     await transaction.rollback();
//     errorResponse(res, {
//       statusCode: 500,
//       message: "Failed to create RFQ.",
//       error: error.message,
//     });
//   }
// };

export const createRequisitionQuotation = async (
  req: Request,
  res: Response
) => {
  const t = await AppDataSource.transaction();
  try {
    const user = (req as any).user;
    const token = req.headers.authorization?.split(" ")[1];
    if (!user?.id || !user?.organization_id || !token) {
      await t.rollback();
      errorResponse(res, {
        message: "User authentication required",
        statusCode: 401,
      });
      return;
    }
    // Validate payload
    const { error, value } = createRequisitionQuotationValidation.validate(
      req.body,
      {
        abortEarly: false,
      }
    );
    if (error) {
      await t.rollback();
      res.status(400).json({ errors: error.details.map((d) => d.message) });
      return;
    }

    const { items, suppliers, ...quotationData } = value;
    const organization_id = user?.organization_id;
    const created_by = user?.id;

    const quote_id = await generateQuotationId(user.organization_id, token);
    // Prepare final quotation data
    const finalQuotationData = {
      ...quotationData,
      quote_id,
      organization_id,
      created_by,
      status: "pending_response",
    };
    // Create quotation
    const quotation = await Quotation.create(finalQuotationData, {
      transaction: t,
    });
    // Create items
    if (items && items.length > 0) {
      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        // Find matching QuotationScoring
        const scoringConfig = await QuotationScoring.findOne({
          where: {
            organization_id: quotation.organization_id,
            org_category_id: item.org_category_id,
          },
          order: [["created_at", "DESC"]],
          transaction: t,
        });

        // Generate quote_item_id with padded index (001, 002, etc.)
        const quoteItemId = `${quotation.quote_id}/item/${String(
          index + 1
        ).padStart(3, "0")}`;

        await QuotationItem.create(
          {
            ...item,
            quotation_id: quotation.id,
            scoring_configuration_id: scoringConfig ? scoringConfig.id : null,
            quote_item_id: quoteItemId,
          },
          { transaction: t }
        );
      }
    }

    // Create suppliers
    if (suppliers && suppliers.length > 0) {
      for (const supplier of suppliers) {
        await QuotationSupplier.create(
          {
            ...supplier,
            quotation_id: quotation.id,
          },
          { transaction: t }
        );
      }
    }
    await t.commit();

    // 🔔 Send notification if selected supplier exists
    if (value.selected_supplier_id) {
      try {
        await http.post(
          `/v1/notification/create`,
          {
            sender_id: user.id,
            receiver_id: value.selected_supplier_id,
            organization_id: user.organization_id,
            subsidiary_id: value.subsidiary_id || null,
            notification_type: "requisition_quotation_created",
            notification_module: "requisition_quotation",
            message: `New requisition quotation ${quotation.quote_id} has been created.`,
          },
          {
            baseURL: service.NOTIFICATION_SERVICE_URL
          }
        );
      } catch (err) {
        console.error("Notification failed:", err);
      }
    }

    res.status(201).json({
      message: "Requisition convert to RFQ successfully",
      data: quotation,
    });
  } catch (err: any) {
    await t.rollback();
    console.error("Error Requisition convert to RFQ:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// getSupplierQuotations
export const getSupplierQuotations = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const supplierId = req.params.supplier_id;
  if (!user?.id || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const result = await executeGetSupplierQuotations(supplierId, user);
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get supplier Quotations.",
      error: error,
    });
  }
};

export const getQuotations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: user?.organization_id,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    subsidiary_id: req.query.subsidiary_id
      ? req.query.subsidiary_id
      : undefined,
    subsidiary_branch_id: req.query.subsidiary_branch_id
      ? req.query.subsidiary_branch_id
      : undefined,
    branch_department_id: req.query.branch_department_id
      ? req.query.branch_department_id
      : undefined,
    status: req.query.status ? Array.isArray(req.query.status) ? req.query.status : (req.query.status as string).split(",") : undefined,
    search: req.query.search ? (req.query.search as string) : undefined,
  };

  const { error } = getQuotationsValidation.validate(requestData);
  if (error) {
    console.error("Joi Validation Error:", error.details);
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetQuotations(requestData);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    console.error("Error in getRequisitions:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Retrieve Requisitions.",
      error: err,
    });
  }
};

export const getQuoteComparison = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { quotationId } = req.params;

    // 🔹 Quotation fetch
    const quotation = await Quotation.findByPk(quotationId);
    if (!quotation) {
      res.status(404).json({ success: false, message: "Quotation not found" });
      return;
    }

    // 🔹 Find all suppliers who submitted
    const suppliers = await QuotationSupplier.findAll({
      where: { quotation_id: quotationId, supplier_status: "sent" },
    });

    // 🔹 Now we do NOT fetch configs by quotation
    // configs aate hain `QuotationItemScoringResult` ke through
    // kyunki waha scoring_configuration_id hota hai jo config ko point karta hai

    const results: any[] = [];

    for (const supplier of suppliers) {
      // Supplier ke saare scoring results
      const scoringResults = await QuotationItemScoringResult.findAll({
        where: { quotation_supplier_id: supplier.id },
        include: [
          {
            model: QuotationScoringConfiguration,
            as: "scoring_config",
          },
        ],
      });

      let totalScore = 0;
      const criteria: any[] = [];

      for (const result of scoringResults) {
        criteria.push({
          criteria: result.scoring_config?.criteria || "Unknown",
          weight: result.scoring_config?.weight || 0,
          raw_value: result.score,
          score: result.final_score,
        });

        totalScore += result.final_score;
      }

      results.push({
        // supplier: supplier.supplier_name,
        criteria,
        totalScore,
      });
    }

    // 🔹 Sort suppliers by total score
    results.sort((a, b) => b.totalScore - a.totalScore);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote comparison",
      error,
    });
  }
};

// ========== suppllier quotation ==========
export const addSupplierQuotation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }
  const payload = req.body;

  const { error, value } = addSupplierQuotationValidation.validate(payload, {
    convert: true,
  });
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeAddSupplierQuotation(value, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: error?.message || "Failed to create Supplier Quotation.",
    });
  }
};

export const getQuotationDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.email || !user?.is_active || !token) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  try {
    const result = await executeGetQuotationDetail(id, token, user);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get quotation detail.",
      error: err,
    });
  }
};

// selectedSupplierQuotation
export const selectedSupplierQuotation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const quotationId = req.params.quotation_id;
  const supplierId = req.params.supplier_id;
  try {
    const result = await executeSelectedSupplierQuotation(
      quotationId,
      supplierId,
      user.organization_id
    );
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get quotation detail.",
      error: err,
    });
  }
};

// statusSupplierLineItem
export const statusSupplierLineItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const {
    delivery_status,
    quantity_delivered,
    admin_receive,
    admin_rejected,
    rejection_message,
  } = req.body;
  try {
    const result = await executeStatusSupplierLineItem(
      id,
      delivery_status,
      quantity_delivered,
      admin_receive,
      admin_rejected,
      rejection_message
    );
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      // data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update Data.",
      error: err,
    });
  }
};

// adminSupplierLineItem
export const adminSupplierLineItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const payload = req.body;
  try {
    const result = await executeAdminSupplierLineItem(payload);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update Data.",
      error: err,
    });
  }
};

// updateQuotationStatus
export const updateQuotationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const id = req.params.id;

  const { error } = updateQuotationStatusValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateQuotationStatus(
      id,
      req.body,
      user,
      transaction
    );
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Update Quotation Status.",
      error: err.original.message,
    });
  }
};

// executeGetQuotationOrderDetail
export const getQuotationOrderDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { supplier_id, quotation_id } = req.params;
  try {
    const result = await executeGetQuotationOrderDetail(
      supplier_id,
      quotation_id
    );
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get quotation order detail.",
      error: err,
    });
  }
};

// ======================= New Api's ===========================
// createQuotation
export const createQuotation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const t = await AppDataSource.transaction();
  try {
    const user = (req as any).user;
    const token = req.headers.authorization?.split(" ")[1];
    if (!user?.id || !user?.organization_id || !token) {
      await t.rollback();
      errorResponse(res, {
        message: "User authentication required",
        statusCode: 401,
      });
      return;
    }
    // Validate payload
    const { error, value } = createQuotationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      await t.rollback();
      res.status(400).json({ errors: error.details.map((d) => d.message) });
      return;
    }

    const { items, suppliers, ...quotationData } = value;
    const organization_id = user?.organization_id;
    const created_by = user?.id;

    const requisitionPayload = mapQuotationToRequisition(value);
    //  Create Requisition First
    const requestResponse = await http.post(
      `/v1/external-requisition/item`,
      requisitionPayload,
      {
        baseURL:
          service.REQUISITION_SERVICE_URL || "http://requisition-service:5006",
        token,
      }
    );

    console.log(" Requisition Response::::", requestResponse.data);

    if (!requestResponse?.success) {
      await t.rollback();
      res.status(requestResponse?.statusCode || 400).json({
        message: requestResponse?.message || "Requisition failed",
        error: requestResponse?.error || null,
      });
      return;
    }
    const quote_id = await generateQuotationId(user.organization_id, token);

    // Prepare final quotation data
    const finalQuotationData = {
      ...quotationData,
      quote_id,
      organization_id,
      created_by,
      status: "pending_response",
      requisition_id: requestResponse.data.data.id,
      request_id: requestResponse.data.data.request_id,
      requisition_date: requestResponse.data.data.request_date,
    };
    // Create quotation
    const quotation = await Quotation.create(finalQuotationData, {
      transaction: t,
    });
    // Create items
    if (items && items.length > 0) {
      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        // Find matching QuotationScoring
        const scoringConfig = await QuotationScoring.findOne({
          where: {
            organization_id: quotation.organization_id,
            org_category_id: item.org_category_id,
          },
          order: [["created_at", "DESC"]],
          transaction: t,
        });

        // Generate quote_item_id with padded index (001, 002, etc.)
        const quoteItemId = `${quotation.quote_id}/item/${String(
          index + 1
        ).padStart(3, "0")}`;

        await QuotationItem.create(
          {
            ...item,
            quotation_id: quotation.id,
            scoring_configuration_id: scoringConfig ? scoringConfig.id : null,
            quote_item_id: quoteItemId,
          },
          { transaction: t }
        );
      }
    }

    // Create suppliers
    if (suppliers && suppliers.length > 0) {
      for (const supplier of suppliers) {
        await QuotationSupplier.create(
          {
            ...supplier,
            quotation_id: quotation.id,
          },
          { transaction: t }
        );
      }
    }
    await t.commit();

    // 🔔 Send notification to selected supplier
    // 🔔 Send notification to ALL suppliers
    if (suppliers && suppliers.length > 0) {
      for (const supplier of suppliers) {
        try {
          console.log("🔔 Sending notification to:", supplier.supplier_id);

          const response = await http.post(
            `/v1/notification/create`,
            {
              sender_id: user.id,
              receiver_id: supplier.supplier_id,
              organization_id: user.organization_id,
              subsidiary_id: value.subsidiary_id || null,
              notification_type: "quotation_created",
              notification_module: "quotation",
              message: `New quotation ${quotation.quote_id} has been created.`,
            },
            {
              baseURL: service.NOTIFICATION_SERVICE_URL,
              token,
            }
          );

          console.log("✅ Notification created:", response.data);
        } catch (err: any) {
          console.error("❌ Notification failed for:", supplier.supplier_id);
          console.error(err.response?.data || err.message);
        }
      }
    } else {
      console.log("⚠️ No suppliers found, notification not sent");
    }

    res
      .status(201)
      .json({ message: "Quotation created successfully", data: quotation });
  } catch (err: any) {
    await t.rollback();
    console.error("Error creating quotation:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getQuotationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // validate params
    const { error } = getQuotationByIdSchema.validate(req.params);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }

    const { id } = req.params;

    const quotation = await Quotation.findOne({
      where: { id },
      include: [
        {
          model: QuotationSupplier,
          as: "suppliers",
          include: [
            {
              model: QuotationNegotiation,
              as: "negotiations",
              required: false, // include even if negotiation doesn’t exist
              separate: true,
              order: [["created_at", "DESC"]],
            },
          ],
        },
        {
          model: QuotationItem,
          as: "items",
        },
      ],
    });

    if (!quotation) {
      errorResponse(res, { message: "Quotation not found", statusCode: 404 });
    }

    const enrichedQuotation = await resolveQuatationRelations(
      quotation?.toJSON()
    );

    const enrichedOrder = {
      ...enrichedQuotation,
    };

    successResponse(res, {
      data: enrichedOrder,
      message: "Quotation fetched successfully",
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get quotation order detail.",
      error: err.message,
    });
  }
};

export const getSupplierQuotationDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // validate params
    const { error } = getQuotationByIdSchema.validate(req.params);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }

    const { id } = req.params;
    const quotation = await Quotation.findOne({
      where: { id },
      include: [
        {
          association: "suppliers",
          where: {
            supplier_id: {
              [Op.eq]: Sequelize.col("Quotation.selected_supplier_id"),
            },
          },
          required: false,
        },
      ],
    });

    if (!quotation) {
      errorResponse(res, { message: "Quotation not found", statusCode: 404 });
    }

    successResponse(res, {
      data: quotation,
      message: "Quotation fetched successfully",
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get quotation order detail.",
      error: err.message,
    });
  }
};

// supplierNegotiation
export const supplierNegotiation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const payload = req.body;
  const t = await AppDataSource.transaction();
  const { error } = updateNegotiationSchema.validate(payload, {
    abortEarly: false,
  });
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: "Validation failed",
      error: error.details[0].message,
    });
    return;
  }

  try {
    const supplier = await QuotationSupplier.findOne({
      where: {
        id: payload.quotation_supplier_id,
        organization_id: user.organization_id,
      },
      transaction: t,
    });

    if (!supplier) {
      await t.rollback();
      errorResponse(res, {
        message: "Supplier Quotation not found",
        statusCode: 404,
      });
      return;
    }

    // 🔹 Step 4: Create negotiation entry
    const negotiation = await QuotationNegotiation.create(
      {
        quotation_supplier_id: payload.quotation_supplier_id,
        quotation_id: payload.quotation_id,
        supplier_id: payload.supplier_id,
        organization_id: user.organization_id,
        offered_price: payload.offered_price,
        offered_delivery_date: payload.offered_delivery_date,
        offered_delivery_days: payload.offered_delivery_days,
        offered_warranty: payload.offered_warranty,
        offered_notes: payload.offered_notes,
        attachments: payload.attachments || [],
        initiated_by: payload.initiated_by,
        status: payload.status || "pending",
        created_at: new Date(),
      },
      { transaction: t }
    );

    if (payload.status === "accepted") {
      const baseDate = new Date(supplier.created_at);
      const deliveryDays = Number(payload.offered_delivery_days || 0);
      const supplierDeliveryDate = new Date(baseDate);
      supplierDeliveryDate.setDate(baseDate.getDate() + deliveryDays);

      await QuotationSupplier.update(
        {
          warranty: payload.offered_warranty,
          supplier_delivery_date: supplierDeliveryDate,
          total_supplier_amount: payload.offered_price,
        },
        {
          where: {
            id: payload.quotation_supplier_id,
            organization_id: user.organization_id,
          },
          transaction: t,
        }
      );
    }

    // Quotation main status update
    await Quotation.update(
      { status: "in_negotiation" },
      {
        where: {
          id: payload.quotation_id,
          organization_id: user.organization_id,
        },
        transaction: t,
      }
    );

    await t.commit();

    // 🔔 Send negotiation notification
    try {
      let receiverId: string | null = null;

      if (payload.initiated_by === "admin") {
        receiverId = payload.supplier_id;
      } else if (payload.initiated_by === "supplier") {
        const quotation = await Quotation.findOne({
          where: { id: payload.quotation_id },
        });
        receiverId = quotation?.created_by || null;
      }

      if (receiverId) {
        await http.post(
          `/v1/notification/create`,
          {
            sender_id: user.id,
            receiver_id: receiverId,
            organization_id: user.organization_id,
            notification_type: "quotation_negotiation",
            notification_module: "negotiation",
            message: `Negotiation ${payload.status} for quotation ${payload.quote_id}.`,
          },
          {
            baseURL: service.NOTIFICATION_SERVICE_URL
          }
        );
      }
    } catch (err) {
      console.error("Negotiation notification failed:", err);
    }

    successResponse(res, {
      statusCode: 200,
      message: "Negotiation created successfully",
      data: negotiation,
    });
  } catch (err) {
    await t.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to create negotiation.",
      error: err,
    });
  }
};

// updateNegotiationStatus
export const updateNegotiationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const { quotation_negotiation_id } = req.params;

  try {
    const negotiation = await QuotationNegotiation.findOne({
      where: {
        id: quotation_negotiation_id,
        organization_id: user.organization_id,
      },
    });

    if (!negotiation) {
      errorResponse(res, {
        statusCode: 404,
        message: "Negotiation not found",
      });
      return;
    }

    negotiation.status = req.body.status;
    await negotiation.save();

    const supplier = await QuotationSupplier.findOne({
      where: {
        id: negotiation.quotation_supplier_id,
        organization_id: user.organization_id,
      },
    });

    if (!supplier) {
      errorResponse(res, {
        message: "Supplier Quotation not found",
        statusCode: 404,
      });
      return;
    }

    if (req.body.status === "accepted") {
      const baseDate = new Date(supplier.created_at);
      const deliveryDays = Number(negotiation.offered_delivery_days || 0);
      const supplierDeliveryDate = new Date(baseDate);
      supplierDeliveryDate.setDate(baseDate.getDate() + deliveryDays);

      await QuotationSupplier.update(
        {
          warranty: negotiation.offered_warranty,
          supplier_delivery_date: supplierDeliveryDate,
          total_supplier_amount: negotiation.offered_price,
        },
        {
          where: {
            id: negotiation.quotation_supplier_id,
            organization_id: user.organization_id,
          },
        }
      );
    }

    successResponse(res, {
      statusCode: 200,
      message: "Negotiation status updated successfully",
      data: negotiation,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update negotiation status.",
      error: err,
    });
  }
};

export const selectQuotationSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const quotationId = req.params.quotation_id;
  const supplierId = req.params.supplier_id;

  const t = await AppDataSource.transaction();

  try {
    const quotation = await Quotation.findOne({
      where: {
        id: quotationId,
        organization_id: user.organization_id,
      },
      transaction: t,
    });

    if (!quotation) {
      await t.rollback();
      errorResponse(res, {
        statusCode: 404,
        message: "Quotation not found",
      });
      return;
    }

    // Quotation update
    quotation.selected_supplier_id = supplierId;
    quotation.status = "supplier_approved";
    await quotation.save({ transaction: t });

    // QuotationSupplier update
    const supplier = await QuotationSupplier.findOne({
      where: {
        supplier_id: supplierId,
        quotation_id: quotationId,
        organization_id: user.organization_id,
      },
      transaction: t,
    });

    if (!supplier) {
      await t.rollback();
      errorResponse(res, {
        statusCode: 404,
        message: "Quotation Supplier not found",
      });
      return;
    }

    supplier.supplier_status = "approved";
    await supplier.save({ transaction: t });

    try {
      console.log(
        "🔔 Sending notification to supplier:",
        supplier.supplier_id
      );

      const response = await http.post(
        "/v1/notification/create",
        {
          sender_id: user.id,
          receiver_id: supplier.supplier_id,
          organization_id: user.organization_id,
          subsidiary_id: quotation.subsidiary_id || null,
          notification_type: "quotation_supplier_selected",
          notification_module: "quotation",
          message: `Your negotiation is successful against quotation ${quotation.quote_id}.`,
        },
        {
          baseURL: service.NOTIFICATION_SERVICE_URL,
          token,
        }
      );

      console.log(
        "✅ Supplier selection notification sent:",
        response.data
      );
    } catch (err: any) {
      console.error(
        "❌ Failed to send notification to supplier:",
        supplier.supplier_id
      );

      console.error(
        err.response?.data || err.message
      );
    }

    await t.commit();

    successResponse(res, {
      statusCode: 200,
      message: "Supplier selected successfully",
      data: {
        quotation,
        supplier,
      },
    });
  } catch (err) {
    await t.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to select supplier.",
      error: err,
    });
  }
};

export const getAllQuotations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const quotations = await Quotation.findAll({
      where: { organization_id: user.organization_id },
      order: [["created_at", "DESC"]],
    });

    successResponse(res, {
      message: "All quotations fetched successfully",
      statusCode: 200,
      data: quotations,
    });
  } catch (error: any) {
    console.error("Error fetching quotations:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

// =================== vendor controller ===================
export const getSupplierQuotationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  console.log("user data : :: ", user);

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: `User authentication required : ${user?.id} , ${user?.email} , ${user?.is_active} , ${user?.organization_id}`,
      statusCode: 401,
    });
    return;
  }

  const supplierId = req.params.supplier_id;

  const {
    search,
    status,
    category,
    date_filter,
    from_date,
    to_date,
    page,
    limit,
  } = req.query;

  const result = await executeGetSupplierQuotation(supplierId, {
    search,
    status,
    category,
    date_filter,
    from_date,
    to_date,
    page,
    limit,
  });

  if (!result.success) {
    errorResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
    return;
  }

  successResponse(res, {
    statusCode: result.statusCode,
    message: result.message,
    data: result.data,
    pagination: result.pagination,
    status_summary: result.status_summary,
  });
};

export const getAllQuotationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await executeGetAllQuotations();

  if (!result.success) {
    errorResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
    return;
  }

  successResponse(res, {
    statusCode: result.statusCode,
    message: result.message,
    data: result.data,
  });
};

export const submitSupplierQuotationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const quotationId = req.params.quotationId;
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  const payload = req.body; // 👈 add this
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  // 1️⃣ Check response due date
  const quotation = await getQuotationByIdServices(quotationId);
  if (!quotation.success || !quotation.data) {
    errorResponse(res, {
      statusCode: 404,
      message: "Quotation not found",
    });
    return;
  }

  const { response_due_date } = quotation.data;

  if (response_due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(response_due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      errorResponse(res, {
        statusCode: 400,
        message: "Response due date has passed. Cannot submit quotation.",
      });
      return;
    }
  }

  // 2️⃣ Update quotation_suppliers record
  const updateSupplier = await updateQuotationSuppliers(quotationId, {
    ...payload,
    supplier_status: "sent",
  });

  if (!updateSupplier.success) {
    errorResponse(res, {
      statusCode: updateSupplier.statusCode,
      message: updateSupplier.message || "Failed to update quotation status.",
      error: updateSupplier.error,
    });
    return;
  }

  // 3️⃣ Update quotations status
  const updateStatus = await updateQuotationStatesus(quotationId, "received");

  if (!updateStatus.success) {
    errorResponse(res, {
      statusCode: updateStatus.statusCode,
      message: updateStatus.message || "Failed to update quotation status.",
      error: updateStatus.error,
    });
    return;
  }

  successResponse(res, {
    statusCode: 200,
    message: "Quotation submitted successfully",
    data: {
      supplierUpdate: updateSupplier.data,
      quotationUpdate: updateStatus.data,
    },
  });

  try {
    const quotationRecord = await Quotation.findOne({
      where: {
        id: quotationId,
      },
    });

    if (quotationRecord?.created_by) {
      console.log(
        "🔔 Sending notification to quotation creator:",
        quotationRecord.created_by
      );

      const response = await http.post(
        "/v1/notification/create",
        {
          sender_id: user.id,
          receiver_id: quotationRecord.created_by,
          organization_id: user.organization_id,
          subsidiary_id: quotationRecord.subsidiary_id || null,
          notification_type: "quotation_submitted",
          notification_module: "quotation",
          message: `Supplier submitted quotation against quotation ${quotationRecord.quote_id}.`,
        },
        {
          baseURL: service.NOTIFICATION_SERVICE_URL,
          token,
        }
      );

      console.log("✅ Notification created:", response.data);
    }
  } catch (err: any) {
    console.error(
      "❌ Notification failed for quotation creator:"
    );
    console.error(err.response?.data || err.message);
  }
};

export const updateSupplierBidController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  try {
    const quotationId = req.params.quotationId; // UUID
    const payload = req.body;

    if (!quotationId) {
      errorResponse(res, {
        statusCode: 400,
        message: "Quotation ID is required",
      });
      return;
    }

    const result = await updateSupplierBidService(quotationId, {
      bid_status: payload.bid_status,
      bid_date_time: payload.bid_date_time,
      total_bid_amount: payload.total_bid_amount,
      comments: payload.comments,
    });

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result.error,
      });
      return;
    }

    try {
      const quotation = await Quotation.findOne({
        where: {
          id: quotationId,
        },
      });

      if (quotation?.created_by) {
        console.log(
          "🔔 Sending bid notification to quotation creator:",
          quotation.created_by
        );

        const response = await http.post(
          "/v1/notification/create",
          {
            sender_id: user.id, // vendor user
            receiver_id: quotation.created_by,
            organization_id: user.organization_id,
            subsidiary_id: quotation.subsidiary_id || null,
            notification_type: "quotation_bid",
            notification_module: "quotation",
            message: `Vendor placed a bid against quotation ${quotation.quote_id}.`,
          },
          {
            baseURL: service.NOTIFICATION_SERVICE_URL,
            token,
          }
        );

        console.log("✅ Notification created:", response.data);
      }
    } catch (err: any) {
      console.error(
        "❌ Notification failed for quotation creator:"
      );
      console.error(err.response?.data || err.message);
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update supplier bid.",
      error: err,
    });
  }
};

export const getQuotationBiddingSummaryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quotationId = req.params.quotationId;
    const supplierId = req.params.supplierId;

    const result = await getQuotationBiddingSummaryService(
      quotationId,
      supplierId
    );

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result.error,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch bidding summary.",
      error: err,
    });
  }
};

export const updateQuotationStatusController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quotationId = req.params.quotationId;
    const { status } = req.body;

    if (!status) {
      errorResponse(res, {
        statusCode: 400,
        message: "Status is required in request body",
      });
      return;
    }

    const result = await updateQuotationStatusService(quotationId, status);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result.error,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update quotation status",
      error: err,
    });
  }
};

// getSupplierQuotationById
export const getSupplierQuotationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { quotation_id, supplier_id } = req.params;

    const quotation = await Quotation.findOne({
      where: { id: quotation_id },
      include: [
        {
          association: "suppliers",
          where: { supplier_id, quotation_id },
          required: false,
          include: [
            {
              association: "negotiations",
              as: "negotiations",
              required: false,
              on: {
                quotation_supplier_id: {
                  [Op.eq]: Sequelize.col("suppliers.id"),
                },
                organization_id: {
                  [Op.eq]: Sequelize.col("suppliers.organization_id"),
                },
              },
              separate: true,
              order: [["created_at", "DESC"]],
            },
          ],
        },
        {
          association: "items",
          as: "items",
        },
      ],
    });

    if (!quotation) {
      errorResponse(res, { message: "Quotation not found", statusCode: 404 });
    }

    successResponse(res, {
      data: quotation,
      message: "Quotation fetched successfully",
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get quotation order detail.",
      error: err.message,
    });
  }
};

export const mapQuotationToRequisition = (quotation: any) => {
  return {
    title: quotation.requisition_title,
    request_date: quotation.requisition_date || new Date(),
    priority: quotation.priority,
    receiving_location: quotation.receiving_location,
    subsidiary_id: quotation.subsidiary_id || null,
    subsidiary_branch_id: quotation.subsidiary_branch_id || null,
    branch_department_id: quotation.branch_department_id || null,
    approval_workflow_id: quotation.approval_workflow_id || null,
    type: "external",
    request_type: quotation.type,
    total_request_amount: quotation.total_quotation_amount, // requisition ka total quotation amount

    // Requisition Items
    external_items: quotation.items.map((item: any) => ({
      item_name: item.item_name,
      item_image: item.item_image || null,
      unit: item.unit,
      category_name: item.category_name,
      org_category_id: item.org_category_id,
      budget_id: item.budget_id,
      budget_item_id: item.budget_item_id,
      quantity: item.quantity,
      use_type: item.use_type,
      unit_price: item.unit_price,
      org_currency_id: item.org_currency_id,
      comment: item.comment || null,
      frequency: item.frequency || null,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      total_price: item.total_price,
      attachments:
        item.attachments?.map((file: any) => ({
          file_url: file.file_url,
          file_name: file.file_name,
        })) || [],
    })),
  };
};

// ====================== backoffice =====================
export const getOrganizationQuotationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { organization_id } = req.params; // get organization_id from route

  if (!organization_id) {
    errorResponse(res, {
      statusCode: 400,
      message: "organization_id is required",
    });
    return;
  }

  const result = await executeGetOrganizationQuotations(organization_id);

  if (!result.success) {
    errorResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      error: result.error,
    });
    return;
  }

  successResponse(res, {
    statusCode: result.statusCode,
    message: result.message,
    data: result.data,
  });
};
