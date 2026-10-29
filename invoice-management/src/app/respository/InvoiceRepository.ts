import { Op, Transaction } from "sequelize";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import { generateInvoiceId } from "../services/OrgSettingService";
import Invoice from "../models/Invoice";

export const executeConvertPurchaseOrderInInvoice = async (
  purchaseOrderId: String,
  user: any,
  token: string,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const created_by = user?.id;
  const invoice_id = await generateInvoiceId(user.organization_id, token);

  const reqResponse: any = await http.get(
    `v1/get-order/${purchaseOrderId}`,
    undefined,
    {
      token,
      baseURL: service.ORDER_SERVICE_URL,
    }
  );

  const finalInvoiceData: any = {
    invoice_id: invoice_id,
    purchase_order_id: purchaseOrderId, // ✅ Use the UUID passed to the function
    organization_id: organization_id,
    created_by: created_by,
    order_id: reqResponse.data.data.order_id, // ✅ Optional, string field like "001"
    quotation_id: reqResponse.data.data.quotation_id,
    requisition_id: reqResponse.data.data.requisition_id,
    subsidiary_id: reqResponse.data.data.subsidiary_id,
    subsidiary_branch_id: reqResponse.data.data.subsidiary_branch_id,
    branch_department_id: reqResponse.data.data.branch_department_id,
    status: "approved",
    selected_supplier_id: reqResponse.data.data.selected_supplier_id,
  };
  const invoice = await Invoice.create(finalInvoiceData, { transaction });
  return {
    success: true,
    statusCode: 201,
    message: "Invoice created successfully.",
    data: {
      ...invoice.toJSON(),
      order: reqResponse?.data?.data,
    },
  };
  //  const { attachments, shared_with, ...purchaseOrderData } = data;

  //   if (attachments?.length) {
  //     await PurchaseOrderAttachment.bulkCreate(
  //       attachments.map((file: any) => ({ ...file, purchase_order_id: purchaseOrder.id })),
  //       { transaction }
  //     );
  //   }

  //    if (shared_with?.length) {
  //     const shareRecords = shared_with.map((share: any) => ({
  //       ...share,
  //       purchase_order_id: purchaseOrder.id,
  //     }));
  //     await SharePurchaseOrder.bulkCreate(shareRecords, { transaction });
  //   }
  //   return {
  //     success: true,
  //     statusCode: 201,
  //     message: "Purchase Order created successfully.",
  //     data: purchaseOrder,
  //   };
};

// executeGetOrders
export const executeGetInvoices = async (requestData: any) => {
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
    whereCondition.status = status;
  }
  if (search && typeof search === "string") {
    whereCondition[Op.or] = [{ invoice_id: { [Op.iLike]: `%${search}%` } }];
  }

  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    const { rows: orders, count: total } = await Invoice.findAndCountAll({
      where: whereCondition,
      offset,
      limit: Number(limit),
      order: [["created_at", "DESC"]],
      raw: true,
    });

    return {
      success: true,
      statusCode: 200,
      message: "Invoices Retrieved Successfully!",
      data: {
        data: orders,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
      },
    };
  }

  const orders = await Invoice.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    raw: true,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Invoices Retrieved Successfully!",
    data: orders,
  };
};
