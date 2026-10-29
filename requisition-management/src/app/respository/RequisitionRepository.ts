import { Op, Transaction } from "sequelize";
import dayjs from "dayjs";
import Requisition from "../models/Requisition";
import { resolveRequisitionRelations } from "../services/RequisitionGrpcService";
import InternalRequisitionItemAttachment from "../models/InternalRequisitionItemAttachment";
import InternalRequisitionItem from "../models/InternalRequisitionItem";
import { generateRequestId } from "../services/OrgSettingService";
import ExternalRequisitionItem from "../models/ExternalRequisitionItem";
import ExternalRequisitionItemAttachment from "../models/ExternalRequisitionItemAttachment";

export const executeCreateInternalRequisition = async (
  data: any,
  user: any,
  token: string,
  transaction: Transaction
) => {
  console.log("=== START executeCreateInternalRequisition ===");

  const organization_id = user?.organization_id;
  const created_by = user?.id;

  console.log("Generating request_id...");
  const request_id = await generateRequestId(user.organization_id, token);
  console.log("Generated request_id:", request_id);

  try {
    console.log("Creating Requisition...");

    const requisition = await Requisition.create(
      {
        request_id: request_id,
        organization_id,
        subsidiary_id: data.subsidiary_id,
        title: data.title,
        priority: data.priority || null,
        subsidiary_branch_id: data.subsidiary_branch_id,
        branch_department_id: data.branch_department_id,
        receiving_location: data.receiving_location,
        request_date: data.request_date,
        approval_workflow_id: data.approval_workflow_id,
        created_by,
        status: "pending",
        type: "internal",
        request_type: data.request_type || "item",
      },
      { transaction }
    );

    console.log("Requisition Created:", requisition?.id);

    for (const item of data.internal_items) {
      console.log("Processing Item:", item);

      const createdItem = await InternalRequisitionItem.create(
        {
          requisition_id: requisition.id,
          org_item_id: item.org_item_id,
          item_name: item.item_name,
          item_image: item.item_image,
          category_name: item.category_name,
          unit: item.unit,
          stock_available: item.stock_available,
          quantity: item.quantity,
          use_type: item.use_type,
          receipt_date: item.receipt_date,
          return_date: item.return_date,
          comment: item.comment,
        },
        { transaction }
      );

      console.log("Item Created:", createdItem?.id);

      if (item.attachments?.length) {
        console.log("Processing Attachments:", item.attachments.length);

        for (const attachment of item.attachments) {
          console.log("Creating Attachment:", attachment);

          await InternalRequisitionItemAttachment.create(
            {
              internal_requisition_item_id: createdItem.id,
              file_name: attachment.file_name,
              file_url: attachment.file_url,
            },
            { transaction }
          );
        }
      }
    }

    console.log("=== SUCCESS executeCreateInternalRequisition ===");

    return {
      success: true,
      statusCode: 201,
      message: "Internal Requisition created successfully.",
      data: requisition,
    };
  } catch (err: any) {
    console.log("Service Catch Error:", err);
    console.log("Error Stack:", err?.stack);

    return {
      success: false,
      statusCode: 500,
      message: "Failed to create internal requisition.",
      error: err?.message || err,
      stack: err?.stack,
    };
  }
};

export const executeCreateExternalRequisition = async (
  data: any,
  user: any,
  token: string,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const created_by = user?.id;
  const request_id = await generateRequestId(user.organization_id, token);
  try {
    const requisition = await Requisition.create(
      {
        request_id: request_id,
        organization_id,
        subsidiary_id: data.subsidiary_id,
        title: data.title,
        priority: data.priority,
        subsidiary_branch_id: data.subsidiary_branch_id,
        branch_department_id: data.branch_department_id,
        receiving_location: data.receiving_location,
        request_date: data.request_date,
        approval_workflow_id: data.approval_workflow_id,
        created_by,
        status: "pending",
        type: "external",
        request_type: data.request_type || "item",
        total_request_amount: data.total_request_amount,
      },
      { transaction }
    );
    for (const item of data.external_items) {
      const createdItem = await ExternalRequisitionItem.create(
        {
          requisition_id: requisition.id,
          item_name: item.item_name,
          org_category_id: item.org_category_id,
          budget_id: item.budget_id,
          budget_item_id: item.budget_item_id,
          quantity: item.quantity,
          use_type: item.use_type,
          unit_price: item.unit_price,
          org_currency_id: item.org_currency_id,
          comment: item.comment,
          frequency: item.frequency,
          start_date: item.start_date,
          end_date: item.end_date,
          total_price: item.total_price,
        },
        { transaction }
      );

      if (item.attachments?.length) {
        for (const attachment of item.attachments) {
          await ExternalRequisitionItemAttachment.create(
            {
              external_requisition_item_id: createdItem.id,
              file_name: attachment.file_name,
              file_url: attachment.file_url,
            },
            { transaction }
          );
        }
      }
    }

    return {
      success: true,
      statusCode: 201,
      message: "External Requisition created successfully.",
      data: requisition,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 400,
      message:
        err?.errors?.[0]?.message ||   // Sequelize validation error
        err?.original?.message ||      // DB error
        err?.message ||
        "Failed to create external requisition.",
      error: err?.errors || err?.original || err?.message,
    };
  }
};

// executeUpdateRequisitionStatus
export const executeUpdateRequisitionStatus = async (
  id: string,
  data: any,
  user: any,
  transaction?: Transaction
) => {
  try {
    // 1. Only allow 'admin' or 'employee'
    if (!["admin", "employee"].includes(user.user_type)) {
      return {
        success: false,
        statusCode: 403,
        message: "You are not authorized to update requisition status.",
      };
    }
    // 2. Find the requisition first
    const request = await Requisition.findOne({
      where: {
        id: id,
        organization_id: user.organization_id,
      },
      transaction,
    });

    // 3. If not found, return 404
    if (!request) {
      return {
        success: false,
        statusCode: 404,
        message:
          "Requisition not found or you don't have permission to update it.",
      };
    }

    // 4. Update the requisition
    await request.update(
      {
        status: data.status,
        last_action_by: data.updated_by,
      },
      { transaction }
    );

    return {
      success: true,
      statusCode: 200,
      message: "Requisition status updated successfully.",
      data: request,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update requisition status.",
      error: err?.original?.message || err?.message,
    };
  }
};

export const executeGetRequisitions = async (requestData: any, user: any) => {
  try {
    const {
      page,
      limit,
      organization_id,
      subsidiary_id,
      subsidiary_branch_id,
      branch_department_id,
      search,
      status,
      type,
      use_type,
      requested_user,
      from_date,
      to_date,
    } = requestData;

    const whereCondition: any = {
      organization_id,
    };

    // Branch filters
    if (subsidiary_id) {
      whereCondition.subsidiary_id = subsidiary_id;
    }
    if (subsidiary_branch_id) {
      whereCondition.subsidiary_branch_id = subsidiary_branch_id;
    }
    if (branch_department_id) {
      whereCondition.branch_department_id = branch_department_id;
    }

    // Admin and Supplier status filters
    if (status) {
      if (Array.isArray(status)) {
        whereCondition.status = { [Op.in]: status };
      } else {
        whereCondition.status = status;
      }
    }

    if (requested_user) { whereCondition.created_by = requested_user; }

    if (type) {
      whereCondition.type = type;
    }
    if (use_type) {
      whereCondition.use_type = use_type;
    }
    // Search filter
    if (search) {
      whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
    }

    if (from_date && to_date) {
      whereCondition.created_at = {
        [Op.between]: [new Date(from_date), new Date(to_date)],
      };
    } else if (from_date) {
      whereCondition.created_at = {
        [Op.gte]: new Date(from_date),
      };
    } else if (to_date) {
      whereCondition.created_at = {
        [Op.lte]: new Date(to_date),
      };
    }

    // Pagination
    if (page && limit) {
      const offset = (Number(page) - 1) * Number(limit);
      const { rows: requisitions, count: total } =
        await Requisition.findAndCountAll({
          where: whereCondition,
          offset,
          limit: Number(limit),
          order: [["created_at", "DESC"]],
          raw: true,
        });

      const enrichedData = await Promise.all(
        requisitions.map(resolveRequisitionRelations)
      );

      // Summary base filters only
      const summaryWhereCondition: any = {
        organization_id,
      };

      if (subsidiary_id) {
        summaryWhereCondition.subsidiary_id = subsidiary_id;
      }

      if (subsidiary_branch_id) {
        summaryWhereCondition.subsidiary_branch_id = subsidiary_branch_id;
      }

      if (branch_department_id) {
        summaryWhereCondition.branch_department_id = branch_department_id;
      }

      // Current Month Range
      const currentStart = dayjs().startOf("month").toDate();
      const currentEnd = dayjs().endOf("month").toDate();

      const lastStart = dayjs().subtract(1, "month").startOf("month").toDate();
      const lastEnd = dayjs().subtract(1, "month").endOf("month").toDate();

      // Monthly trend counts
      const getMonthlyCounts = async (start: Date, end: Date) => {
        const data = await Requisition.findAll({
          where: {
            organization_id,
            request_date: {
              [Op.between]: [
                dayjs(start).format("YYYY-MM-DD"),
                dayjs(end).format("YYYY-MM-DD"),
              ],
            },
          },
          raw: true,
        });

        return {
          total: data.length,
          pending: data.filter(r => r.status === "pending").length,
          approved: data.filter(r => r.status === "approved").length,
        };
      };

      const currentMonth = await getMonthlyCounts(currentStart, currentEnd);
      const lastMonth = await getMonthlyCounts(lastStart, lastEnd);

      // Percentage calculator
      const calculateTrend = (current: number, last: number) => {
        if (last === 0 && current === 0) {
          return { percentage: 0, trend: "no_change" };
        }
        if (last === 0) {
          return { percentage: 100, trend: "up" };
        }

        const change = ((current - last) / last) * 100;

        return {
          percentage: Math.abs(Number(change.toFixed(2))),
          trend: change > 0 ? "up" : change < 0 ? "down" : "no_change",
        };
      };

      const totalTrend = calculateTrend(currentMonth.total, lastMonth.total);
      const pendingTrend = calculateTrend(currentMonth.pending, lastMonth.pending);
      const approvedTrend = calculateTrend(currentMonth.approved, lastMonth.approved);


      return {
        success: true,
        statusCode: 200,
        message: "Requisitions Retrieved Successfully!",
        data: {
          data: enrichedData,
          total,
          pages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),

          summary: {
            total_requisitions: currentMonth.total,
            total_requisitions_change: totalTrend.percentage,
            total_requisitions_trend: totalTrend.trend,

            pending_requisitions: currentMonth.pending,
            pending_requisitions_change: pendingTrend.percentage,
            pending_requisitions_trend: pendingTrend.trend,

            approved_requisitions: currentMonth.approved,
            approved_requisitions_change: approvedTrend.percentage,
            approved_requisitions_trend: approvedTrend.trend,
          },
        },
      };
    }

    // No pagination
    const requisitions = await Requisition.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      raw: true,
    });

    const enrichedData = await Promise.all(
      requisitions.map(resolveRequisitionRelations)
    );

    return {
      success: true,
      statusCode: 200,
      message: "Requisitions Retrieved Successfully!",
      data: enrichedData,
    };
  } catch (err) {
    console.error("Error in executeGetRequisitions:", err);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to Retrieve Requisitions.",
      error: err,
    };
  }
};

export const executeUpdateInternalItemRequisition = async (
  requisitionId: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const { internal_items, ...updatedPayload } = payload;

  const existingRequisition = await Requisition.findOne({
    where: {
      id: requisitionId,
      organization_id: user.organization_id,
      type: "internal",
      request_type: "item",
    },
  });

  if (!existingRequisition) {
    return {
      success: false,
      statusCode: 404,
      message: "Internal item requisition not found.",
    };
  }
  if (!["pending", "in_revision"].includes(existingRequisition.status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Cannot update requisition with current status.",
    };
  }

  await Requisition.update(
    {
      ...updatedPayload,
      last_action_by: user.id,
    },
    {
      where: { id: requisitionId },
      transaction,
    }
  );

  if (internal_items !== undefined) {
    const payloadServiceIds = internal_items
      .filter((service: any) => service.id)
      .map((service: any) => service.id);

    await InternalRequisitionItem.destroy({
      where: {
        requisition_id: requisitionId,
        ...(payloadServiceIds.length > 0 && {
          id: { [Op.notIn]: payloadServiceIds },
        }),
      },
      transaction,
    });

    const itemPromises = internal_items.map(async (item: any) => {
      const { attachments, ...itemData } = item;
      const finalItemData = {
        ...itemData,
        requisition_id: requisitionId,
      };

      let processedItem;
      if (item.id) {
        await InternalRequisitionItem.update(finalItemData, {
          where: {
            id: item.id,
            requisition_id: requisitionId,
          },
          transaction,
        });
        processedItem = { ...finalItemData, id: item.id };
      } else {
        const newItem = await InternalRequisitionItem.create(finalItemData, {
          transaction,
        });
        processedItem = newItem.toJSON();
      }

      if (attachments !== undefined) {
        const payloadAttachmentIds = attachments
          .filter((attachment: any) => attachment.id)
          .map((attachment: any) => attachment.id);

        await InternalRequisitionItemAttachment.destroy({
          where: {
            internal_requisition_item_id: processedItem.id,
            ...(payloadAttachmentIds.length > 0 && {
              id: { [Op.notIn]: payloadAttachmentIds },
            }),
          },
          transaction,
        });

        const attachmentPromises = attachments.map(async (attachment: any) => {
          const attachmentData = {
            ...attachment,
            internal_requisition_item_id: processedItem.id,
          };

          if (attachment.id) {
            await InternalRequisitionItemAttachment.update(attachmentData, {
              where: {
                id: attachment.id,
                internal_requisition_item_id: processedItem.id,
              },
              transaction,
            });
            return { ...attachmentData, id: attachment.id };
          } else {
            const newAttachment =
              await InternalRequisitionItemAttachment.create(attachmentData, {
                transaction,
              });
            return newAttachment.toJSON();
          }
        });

        const processedAttachments = await Promise.all(attachmentPromises);
        processedItem.attachments = processedAttachments;
      }

      return processedItem;
    });

    await Promise.all(itemPromises);
  }
  return {
    success: true,
    statusCode: 200,
    message: "Internal Item requisition updated successfully.",
  };
};

export const executeUpdateExternalItemRequisition = async (
  requisitionId: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const { external_items, ...updatedPayload } = payload;

  const existingRequisition = await Requisition.findOne({
    where: {
      id: requisitionId,
      organization_id: user.organization_id,
      type: "external",
      request_type: "item",
    },
  });

  if (!existingRequisition) {
    return {
      success: false,
      statusCode: 404,
      message: "External item requisition not found.",
    };
  }
  if (!["pending", "in_revision"].includes(existingRequisition.status)) {
    return {
      success: false,
      statusCode: 400,
      message: "Cannot update requisition with current status.",
    };
  }

  await Requisition.update(
    {
      ...updatedPayload,
      last_action_by: user.id,
    },
    {
      where: { id: requisitionId },
      transaction,
    }
  );

  if (external_items !== undefined) {
    const payloadItemIds = external_items
      .filter((service: any) => service.id)
      .map((service: any) => service.id);

    await ExternalRequisitionItem.destroy({
      where: {
        requisition_id: requisitionId,
        ...(payloadItemIds.length > 0 && {
          id: { [Op.notIn]: payloadItemIds },
        }),
      },
      transaction,
    });

    const itemPromises = external_items.map(async (item: any) => {
      const { attachments, ...itemData } = item;
      const finalItemData = {
        ...itemData,
        requisition_id: requisitionId,
      };

      let processedItem;
      if (item.id) {
        await ExternalRequisitionItem.update(finalItemData, {
          where: {
            id: item.id,
            requisition_id: requisitionId,
          },
          transaction,
        });
        processedItem = { ...finalItemData, id: item.id };
      } else {
        const newItem = await ExternalRequisitionItem.create(finalItemData, {
          transaction,
        });
        processedItem = newItem.toJSON();
      }

      if (attachments !== undefined) {
        const payloadAttachmentIds = attachments
          .filter((attachment: any) => attachment.id)
          .map((attachment: any) => attachment.id);

        await ExternalRequisitionItemAttachment.destroy({
          where: {
            external_requisition_item_id: processedItem.id,
            ...(payloadAttachmentIds.length > 0 && {
              id: { [Op.notIn]: payloadAttachmentIds },
            }),
          },
          transaction,
        });

        const attachmentPromises = attachments.map(async (attachment: any) => {
          const attachmentData = {
            ...attachment,
            external_requisition_item_id: processedItem.id,
          };

          if (attachment.id) {
            await ExternalRequisitionItemAttachment.update(attachmentData, {
              where: {
                id: attachment.id,
                external_requisition_item_id: processedItem.id,
              },
              transaction,
            });
            return { ...attachmentData, id: attachment.id };
          } else {
            const newAttachment =
              await ExternalRequisitionItemAttachment.create(attachmentData, {
                transaction,
              });
            return newAttachment.toJSON();
          }
        });

        const processedAttachments = await Promise.all(attachmentPromises);
        processedItem.attachments = processedAttachments;
      }

      return processedItem;
    });

    await Promise.all(itemPromises);
  }

  return {
    success: true,
    statusCode: 200,
    message: "External Item requisition updated successfully.",
  };
};

export const executeGetExternalItemRequisition = async (
  id: string,
  organization_id: string
) => {
  const requisitionDetail = await Requisition.findOne({
    where: { id, organization_id },
    include: [
      {
        model: ExternalRequisitionItem,
        as: "external_items",
        include: [
          {
            model: ExternalRequisitionItemAttachment,
            as: "attachments",
          },
        ],
      },
    ],
  });
  if (!requisitionDetail) {
    return {
      success: false,
      statusCode: 404,
      message: "Requisition not found",
    };
  }
  // Convert to plain object
  const plainRequisition = requisitionDetail.get({ plain: true });

  // Resolve relational entities (subsidiary, branch, etc.)
  const enriched = await resolveRequisitionRelations(plainRequisition);

  // Optionally flatten or clean external_items' attachments
  enriched.external_items = enriched.external_items.map((item: any) => ({
    ...item,
  }));

  return {
    success: true,
    statusCode: 200,
    message: "Requisition data retrieved successfully",
    data: enriched,
  };
};

export const executeGetInternalItemRequisition = async (
  id: string,
  organization_id: string
) => {
  const requisitionDetail = await Requisition.findOne({
    where: { id, organization_id },
    include: [
      {
        model: InternalRequisitionItem,
        as: "internal_items",
        include: [
          {
            model: InternalRequisitionItemAttachment,
            as: "attachments",
          },
        ],
      },
    ],
  });
  if (!requisitionDetail) {
    return {
      success: false,
      statusCode: 404,
      message: "Requisition not found",
    };
  }
  const enriched = await resolveRequisitionRelations(requisitionDetail);

  return {
    success: true,
    statusCode: 200,
    message: "Requisition data retrieved successfully",
    data: enriched,
  };
};
