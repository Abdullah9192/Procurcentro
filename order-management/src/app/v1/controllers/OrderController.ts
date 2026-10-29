import express, { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import AppDataSource from "../../../config/DatabaseSource";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import Order from "../../models/Order";
import {
  getOrdersValidation,
  supplierLineItemReceiving,
} from "../validators/OrderValidation";
import {
  executeConvertQuotationInOrder,
  executeGetAllPO,
  executeGetInvoiceListing,
  executeGetOrderDetail,
  executeGetOrders,
  executeGetOrganizationOrder,
  executeGetPO,
  executeGetReceivingListing,
  executeStatusOrderSupplierLineItem,
  executeUpdateOrderStatus,
  executeUpdateSupplierItems,
  executeUpdateSupplierStatus,
} from "../../respository/OrderRepository";
import ShareOrder from "../../models/ShareOrder";
import OrderSupplierItem from "../../models/OrderSupplierItem";
import { resolvePurchaseOrderRelations } from "../../services/OrderGrpcService";
import OrderComment from "../../models/OrderComment";
import { generateGRNId } from "../../services/GrnService";
import OrderReceiving from "../../models/OrderReceiving";
import {
  getBranchById,
  getDepartmentById,
  getOrganizationById,
  getUserById,
} from "../../../grpc/clients/AdminGrpcClient";
import { generateInvoiceNo } from "../../services/InvoiceService";
import { getSupplierById } from "../../../grpc/clients/SupplierGrpcClient";
import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";

// convertQuotationInOrder
export const convertQuotationInOrder = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  const quotationId = req.params.quotation_id;
  if (!user?.id || !user?.organization_id || !token) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeConvertQuotationInOrder(
      quotationId,
      user,
      token,
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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to create purchase order.",
      error: error.message.original,
    });
  }
};

// getOrders
export const getOrders = async (req: Request, res: Response): Promise<void> => {
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
    admin_status: req.query.status ? Array.isArray(req.query.status) ? req.query.status : (req.query.status as string).split(",") : undefined,
    supplier_status: req.query.supplier_status
      ? req.query.supplier_status
      : undefined,
    invoice_admin_status_filter: req.query.invoice_admin_status
      ? req.query.invoice_admin_status
      : undefined,
    invoice_supplier_status_filter: req.query.invoice_supplier_status
      ? req.query.invoice_supplier_status
      : undefined,
    search: req.query.search ? (req.query.search as string) : undefined,
    supplier_id: req.query.supplier_id ? req.query.supplier_id : undefined,
    receiving_status: req.query.receiving_status
      ? req.query.receiving_status
      : undefined,
    delivery_date: req.query.delivery_date
      ? req.query.delivery_date
      : undefined,
  };

  const { error } = getOrdersValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetOrders(requestData, user);
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
    console.error("Error in get Purchase Orders:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Retrieve Purchase Orders.",
      error: err,
    });
  }
};

// shareOrder
export const shareOrder = async (
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

  const { order_id } = req.params;
  const { emails, notes } = req.body;
  // users: [{ user_id: string, email: string }]

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    errorResponse(res, {
      message: "Emails are required to share the order",
      statusCode: 400,
    });
    return;
  }

  try {
    const sharedOrders = await Promise.all(
      emails.map((email: string) =>
        ShareOrder.create({
          order_id,
          email,
          notes: notes || null,
        })
      )
    );
    //  // Setup email transporter
    // const transporter = nodemailer.createTransport({
    //   service: "Gmail", // or SMTP config if you want custom
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // // Send email
    // await transporter.sendMail({
    //   from: `"Your App" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "Document Shared with You",
    //   html: `
    //     <p>Hello,</p>
    //     <p>A document has been shared with you.</p>
    //     <p>Document ID: <b>${document_id}</b></p>
    //   `,
    // });

    successResponse(res, {
      statusCode: 201,
      message: "Order shared successfully",
      data: sharedOrders,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to share purchase order.",
      error: err?.message || "Internal error",
    });
  }
};

// getOrder
export const getOrderDetail = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  try {
    const result = await executeGetOrderDetail(id);
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
      message: "Failed to get purchase order detail.",
      error: err,
    });
  }
};

// updateOrderStatus
export const updateOrderStatus = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const {
    admin_status,
    supplier_status,
    receiving_status,
    invoice_supplier_status,
    invoice_admin_status,
    updated_by,
    attachments,
  } = req.body;
  try {
    const result = await executeUpdateOrderStatus(
      id,
      admin_status,
      supplier_status,
      receiving_status,
      invoice_supplier_status,
      invoice_admin_status,
      updated_by,
      attachments,
      user
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
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update purchase order status.",
      error: err,
    });
  }
};

// statusOrderSupplierLineItem
export const statusOrderSupplierLineItems = async (
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
  const { error, value } = supplierLineItemReceiving.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const {
    order_id,
    currency,
    order_admin_invoice_status,
    admin_invoice_status,
    items,
  } = value;

  try {
    const result = await executeStatusOrderSupplierLineItem(
      order_id,
      currency,
      items,
      user,
      order_admin_invoice_status,
      admin_invoice_status
    );
    successResponse(res, {
      statusCode: 200,
      message: "Batch update completed",
      data: result,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update items",
      error: err,
    });
  }
};

// createOrderGRNDocument
export const createOrderGRNDocument = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { order_id } = req.params;
};

// getReceivingListing
export const getReceivingListing = async (
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
    search: req.query.search ? (req.query.search as string) : undefined,
    supplier_id: req.query.supplier_id ? req.query.supplier_id : undefined,
    receiving_status: req.query.receiving_status
      ? req.query.receiving_status
      : undefined,
  };

  const { error } = getOrdersValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetReceivingListing(requestData, user);
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
    console.error("Error in get Receiving Listing:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Retrieve Receiving Listing.",
      error: err,
    });
  }
};

// getReceivingDetail
export const getReceivingDetail = async (
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

  const { order_id } = req.params;
  const orderDetail = await Order.findOne({
    where: { id: order_id },
    include: [
      {
        model: OrderSupplierItem,
        as: "items",
      },
      {
        model: OrderComment,
        as: "comments",
        where: { type: "receiving" },
        required: false,
        include: [
          {
            model: OrderComment,
            as: "replies",
            required: false,
          },
        ],
      },
    ],
  });

  if (!orderDetail) {
    errorResponse(res, {
      statusCode: 404,
      message: "Order not found",
    });
  }
  try {
    const enrichedPO = await resolvePurchaseOrderRelations(
      orderDetail?.toJSON()
    );

    let supplierDetails = null;

    if (enrichedPO.selected_supplier_id) {
      const supplierData = await AppDataSource.query(
        `
    SELECT
      u.id,
      u.name AS vendor_name,
      u.email AS vendor_email,
      si.business_name,
      si.address,
      sc.contact_name,
      sc.contact_phone
    FROM users u
    LEFT JOIN supplier_infos si
      ON si.user_id = u.id
    LEFT JOIN supplier_contacts sc
      ON sc.user_id = u.id
    WHERE u.id = :supplierId
    LIMIT 1
    `,
        {
          replacements: {
            supplierId: enrichedPO.selected_supplier_id,
          },
          type: QueryTypes.SELECT,
        }
      );

      supplierDetails = supplierData?.[0] || null;
    }

    const enrichedOrder = {
      ...enrichedPO,
      supplier_details: supplierDetails,
    };

    successResponse(res, {
      statusCode: 200,
      message: "Order fetched successfully",
      data: enrichedOrder,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch order",
      error: error,
    });
  }
};

export const updateIs3Way = async (req: Request, res: Response): Promise<void> => {
  try {
    const { order_id } = req.params;

    // Find the record first
    const orderReceiving = await OrderReceiving.findOne({ where: { order_id } });

    if (!orderReceiving) {
      errorResponse(res, {
        statusCode: 404,
        message: "Order receiving record not found",
      });
      return;
    }

    // Update is_3way flag
    orderReceiving.is_3way = true;
    await orderReceiving.save();

    successResponse(res, {
      statusCode: 200,
      message: "is_3way updated successfully",
      data: orderReceiving,
    });
  } catch (error: any) {
    console.error("🔥 Error updating is_3way:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update is_3way",
      error: error.message || error,
    });
  }
};

// ================ vendor side ====================
export const getSupplierPOController = async (
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

  const supplierId = req.params.selected_supplier_id;

  if (!supplierId) {
    errorResponse(res, {
      statusCode: 400,
      message: "supplierId is required in params",
    });
    return;
  }

  // ✅ pagination query params (optional)
  const page = req.query.page ? parseInt(req.query.page as string) : undefined;
  const pageSize = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;
  const status = req.query.status as string | undefined;
  const requisitionTitle = req.query.requisition_title as string | undefined;

  const totalAmountFrom = req.query.total_order_amount_from
    ? Number(req.query.total_order_amount_from)
    : undefined;

  const totalAmountTo = req.query.total_order_amount_to
    ? Number(req.query.total_order_amount_to)
    : undefined;

  const supplierDeliveryDate = req.query
    .supplier_delivery_date as string | undefined;

  const result = await executeGetPO(
    supplierId,
    page,
    pageSize,
    status,
    requisitionTitle,
    totalAmountFrom,
    totalAmountTo,
    supplierDeliveryDate
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
    data: result.data, // ✅ only data returned (no meta)
  });
};

export const getAllPOController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize as string, 10)
    : 10;

  const result = await executeGetAllPO(page, pageSize);

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

export const updateSupplierStatusController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];

  // check user authentication
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const orderId = req.params.id;
  const { supplier_status } = req.body;

  if (!supplier_status) {
    errorResponse(res, {
      statusCode: 400,
      message: "supplier_status is required",
    });
    return;
  }

  const result = await executeUpdateSupplierStatus(orderId, supplier_status, user, token);

  if (!result.success) {
    errorResponse(res, {
      statusCode: result.status_code,
      message: result.message,
    });
    return;
  }

  successResponse(res, {
    statusCode: result.status_code,
    message: result.message,
    data: result.data,
  });
};

export const updateSupplierItemsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const quotationId = req.params.quotation_id;
  const { items } = req.body; // expect array of {id, delivery_status}

  if (!items || !Array.isArray(items) || items.length === 0) {
    errorResponse(res, {
      statusCode: 400,
      message: "Invalid request. 'items' array is required.",
    });
    return;
  }

  const result = await executeUpdateSupplierItems(quotationId, items);

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

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res as express.Response, {
      message: "User authentication required",
      statusCode: 401,
    });
  }

  try {
    const orders = await Order.findAll({
      where: { organization_id: user.organization_id },
      order: [["created_at", "DESC"]],
    });

    successResponse(res as express.Response, {
      message: "All orders fetched successfully",
      statusCode: 200,
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    errorResponse(res as express.Response, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

// invoice vendor side
export const getAllInvoiceRequestedOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplier_id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Fetch all invoice requested orders for given supplier
    const { rows: orders, count: total } = await OrderReceiving.findAndCountAll(
      {
        where: {
          supplier_id,
          invoice_requested: true,
        },
        order: [["created_at", "DESC"]],
        limit,
        offset,
      }
    );

    // Enrich each order with organization, order, branch, department data
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderData = order.toJSON();
        console.log("🟦 Processing order_receiving ID:", orderData.id);

        let organization = null;
        let orderDetail = null;
        let branch = null;
        let department = null;
        try {
          // ✅ Get organization details via gRPC
          if (orderData.organization_id) {
            organization = await getOrganizationById(order.organization_id);
          }
          console.log("🔹 organization_id:", order.organization_id);

          // ✅ Get order record
          if (orderData.order_id) {
            orderDetail = await Order.findByPk(order.order_id);
          }

          // ✅ If order record found, get branch & department via gRPC
          if (orderDetail) {
            if (orderDetail.subsidiary_branch_id) {
              branch = await getBranchById(orderDetail.subsidiary_branch_id);
            }
            if (orderDetail.branch_department_id) {
              department = await getDepartmentById(
                orderDetail.branch_department_id
              );
            }
          }

          return {
            ...order.toJSON(),
            organization,
            order: orderDetail,
            branch,
            department,
          };
        } catch (innerErr) {
          console.error("❌ Error enriching order:", innerErr);
          return {
            ...order.toJSON(),
            organization: null,
            order: null,
            branch: null,
            department: null,
          };
        }
      })
    );

    const totalPages = Math.ceil(total / limit);

    successResponse(res, {
      message: "Supplier invoices fetched successfully",
      data: {
        current_page: page,
        total_pages: totalPages,
        total_records: total,
        per_page: limit,
        records: enrichedOrders,
      },
    });
  } catch (err: any) {
    console.error("❌ Error in getAllInvoiceRequestedOrders:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch supplier invoices.",
      error: err.message,
    });
  }
};

// ✅ Add this helper function here
function isOrderReceiving(
  value: any
): value is InstanceType<typeof OrderReceiving> {
  return value instanceof OrderReceiving;
}

export const getSupplierInvoiceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { invoice_id } = req.params;

    // 🧾 Fetch the record by its main ID
    const orderReceiving = await OrderReceiving.findOne({
      where: { id: invoice_id },
    });

    if (!isOrderReceiving(orderReceiving)) {
      errorResponse(res, {
        message: "Invoice not found",
        statusCode: 404,
      });
      return;
    }

    const organizationId = orderReceiving.organization_id;
    const orderId = orderReceiving.order_id;

    // 🏢 Fetch related organization info
    const organization = organizationId
      ? await getOrganizationById(organizationId)
      : null;

    // 🧾 Fetch related order details
    const orderDetail = await Order.findOne({ where: { id: orderId } });

    // 🏬 Fetch branch & department info (if orderDetail exists)
    const branch = orderDetail?.subsidiary_branch_id
      ? await getBranchById(orderDetail.subsidiary_branch_id)
      : null;

    const supplier = orderDetail?.selected_supplier_id
      ? await getSupplierById(orderDetail.selected_supplier_id)
      : null;

    const created = orderDetail?.created_by
      ? await getUserById(orderDetail.created_by)
      : null;

    const department = orderDetail?.branch_department_id
      ? await getDepartmentById(orderDetail.branch_department_id)
      : null;

    // 🧠 Construct enriched response
    const enrichedOrderReceiving = {
      ...orderReceiving.toJSON(),
      organization,
      order: orderDetail,
      branch,
      department,
      supplier,
      created,
    };

    successResponse(res, {
      data: enrichedOrderReceiving,
      message: "Supplier invoice fetched successfully",
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch supplier invoice.",
      error: err.message,
    });
  }
};

export const updateSupplierInvoiceStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { invoice_id } = req.params;
    const { supplier_invoice_status } = req.body;

    if (!supplier_invoice_status) {
      errorResponse(res, {
        statusCode: 400,
        message: "supplier_invoice_status is required",
      });
      return;
    }

    // 🧾 Fetch the record by ID
    const orderReceiving = await OrderReceiving.findOne({
      where: { id: invoice_id },
    });

    if (!orderReceiving) {
      errorResponse(res, {
        statusCode: 404,
        message: "Invoice record not found",
      });
      return;
    }

    // 🚫 Ensure invoice_requested is true
    if (!orderReceiving.invoice_requested) {
      errorResponse(res, {
        statusCode: 400,
        message: "Invoice cannot be updated — invoice_requested is false",
      });
      return;
    }

    // 🔢 Generate new invoice_gen_id
    const invoiceGenId = await generateInvoiceNo();

    // 🛠️ Update the record
    orderReceiving.supplier_invoice_status = supplier_invoice_status;
    orderReceiving.invoice_gen_id = invoiceGenId;
    await orderReceiving.save();

    successResponse(res, {
      message: "Supplier invoice status updated successfully",
      data: orderReceiving,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update supplier invoice status.",
      error: err.message,
    });
  }
};

//  ========= Update Order Attachments and Invoice Links =====================
export const updateInvoiceData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { order_id } = req.params;
    const { invoice_link, order_link, grn_link, docs } = req.body;

    // ✅ Validate that at least one field is provided
    if (!invoice_link && !order_link && !grn_link && !docs) {
      errorResponse(res, {
        statusCode: 400,
        message:
          "Please provide at least one field to update (invoice_link or grn_link or order_link).",
      });
      return;
    }

    // 🧾 Find OrderReceiving by order_id
    const orderReceiving = await OrderReceiving.findOne({
      where: { order_id },
    });

    if (!orderReceiving) {
      errorResponse(res, {
        statusCode: 404,
        message: "OrderReceiving record not found for provided order_id.",
      });
      return;
    }

    // 🧾 Find Order by id
    const order = await Order.findOne({
      where: { id: order_id },
    });

    if (!order) {
      errorResponse(res, {
        statusCode: 404,
        message: "Order record not found for provided order_id.",
      });
      return;
    }

    // 🛠️ Update invoice_link in OrderReceiving (if provided)
    if (invoice_link) {
      orderReceiving.invoice_link = invoice_link;
      await orderReceiving.save();
    }

    if (order_link) {
      orderReceiving.order_link = order_link;
      await orderReceiving.save();
    }

    if (grn_link) {
      orderReceiving.grn_link = grn_link;
      await orderReceiving.save();
    }

    // 🛠️ Update docs in Orders (if provided)
    if (docs) {
      order.docs = docs;
      await order.save();
    }

    // Update supplier invoice status
    orderReceiving.supplier_invoice_status = "ready_for_invoice";
    await order.save();

    successResponse(res, {
      message: "Invoice links attachments updated successfully",
      data: {
        order_receiving: invoice_link ? orderReceiving : undefined,
        order: docs ? order : undefined,
      },
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update invoice data.",
      error: err.message,
    });
  }
};

export const sendNotificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (
      !user?.id ||
      !user?.organization_id ||
      !user?.is_active
    ) {
      errorResponse(res, {
        statusCode: 401,
        message: "User authentication required",
      });
      return;
    }

    const token =
      req.headers.authorization?.split(" ")[1];

    const {
      receiver_id,
      sender_id,
      organization_id,
      subsidiary_id,
      notification_type,
      notification_module,
      message,
    } = req.body;

    if (
      !receiver_id ||
      !notification_type ||
      !notification_module ||
      !message
    ) {
      errorResponse(res, {
        statusCode: 400,
        message:
          "receiver_id, notification_type, notification_module and message are required",
      });
      return;
    }

    const response = await http.post(
      "/v1/notification/create",
      {
        sender_id:
          sender_id,

        receiver_id,

        organization_id:
          organization_id ||
          user.organization_id,

        subsidiary_id:
          subsidiary_id || null,

        notification_type,

        notification_module,

        message,
      },
      {
        baseURL:
          service.NOTIFICATION_SERVICE_URL,

        token,
      }
    );

    successResponse(res, {
      statusCode: 200,
      message:
        "Reminded to buyer successfully",
      data: response.data,
    });
  } catch (err: any) {
    console.error(
      "Notification Error:",
      err.response?.data || err.message
    );

    errorResponse(res, {
      statusCode: 500,
      message: "Failed to send notification",
      error:
        err.response?.data ||
        err.message,
    });
  }
};

// ====================== backoffice =====================
export const getOrganizationOrderController = async (
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

  const result = await executeGetOrganizationOrder(organization_id);
  console.log("result", result);
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

// ✅ CREATE COMMENT (main comment or reply)
export const createOrderComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  // check user authentication
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  try {
    const {
      order_id,
      organization_id,
      comment,
      status,
      type,
      created_by,
      created_user_name,
      parent_id,
    } = req.body;

    // 🔹 Validate required fields
    if (
      !order_id ||
      !organization_id ||
      !comment ||
      !type ||
      !created_by ||
      !created_user_name
    ) {
      errorResponse(res, {
        statusCode: 400,
        message:
          "order_id, organization_id, comment, created_by, and created_user_name and type are required.",
      });
      return;
    }

    // 🔹 Check if related order exists
    const order = await Order.findByPk(order_id);
    if (!order) {
      errorResponse(res, {
        statusCode: 404,
        message: "Order not found",
      });
      return;
    }

    // 🔹 Create the comment
    const newComment = await OrderComment.create({
      order_id,
      organization_id,
      comment,
      status: status || "pending",
      type,
      created_by,
      created_user_name,
      parent_id: parent_id || null,
    });

    try {
      const [quotation]: any = await AppDataSource.query(
        `
    SELECT
      q.id,
      q.quote_id,
      q.created_by,
      q.selected_supplier_id
    FROM quotations q
    INNER JOIN orders o
      ON o.quotation_id = q.id
    WHERE o.id = :orderId
    LIMIT 1
    `,
        {
          replacements: {
            orderId: order_id,
          },
          type: QueryTypes.SELECT,
        }
      );

      if (quotation) {
        const employeeId = quotation.created_by;
        const vendorId = quotation.selected_supplier_id;

        const receivers: string[] = [];

        // Employee commented -> Vendor
        if (user.id === employeeId && vendorId) {
          receivers.push(vendorId);
        }

        // Vendor commented -> Employee
        else if (user.id === vendorId && employeeId) {
          receivers.push(employeeId);
        }

        // Unknown source -> Notify both
        else {
          if (employeeId) receivers.push(employeeId);
          if (vendorId) receivers.push(vendorId);
        }

        const notificationMessage = comment
          ? `New comment added in order ${order.order_id}.`
          : `Comment status changed to ${status} in order ${order.order_id}.`;

        for (const receiverId of receivers) {
          if (receiverId === user.id) continue;

          try {
            console.log("🔔 Sending comment notification", {
              sender: user.id,
              receiver: receiverId,
            });

            await http.post(
              "/v1/notification/create",
              {
                sender_id: user.id,
                receiver_id: receiverId,
                organization_id,
                subsidiary_id: order.subsidiary_id || null,
                notification_type: "order_comment",
                notification_module: "purchase_order",
                message: notificationMessage,
              },
              {
                baseURL: service.NOTIFICATION_SERVICE_URL,
                token,
              }
            );

            console.log(
              "✅ Comment notification sent:",
              receiverId
            );
          } catch (err: any) {
            console.error(
              "❌ Comment notification failed:",
              receiverId
            );
            console.error(
              err.response?.data || err.message
            );
          }
        }
      }
    } catch (err: any) {
      console.error(
        "❌ Failed preparing comment notification:"
      );
      console.error(
        err.response?.data || err.message
      );
    }

    successResponse(res, {
      statusCode: 201,
      message: "Comment created successfully.",
      data: newComment,
    });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ UPDATE COMMENT STATUS
export const updateOrderCommentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 🔹 Validate input
    if (
      !status ||
      !["pending", "resolved", "delayed", "rejected"].includes(status)
    ) {
      errorResponse(res, {
        statusCode: 400,
        message: "Invalid or missing status value.",
      });
      return;
    }

    // 🔹 Find comment
    const comment = await OrderComment.findByPk(id);
    if (!comment) {
      errorResponse(res, {
        statusCode: 404,
        message: "Comment not found.",
      });
      return;
    }

    // 🔹 Update status
    await comment.update({ status });

    successResponse(res, {
      statusCode: 200,
      message: "Comment status updated successfully.",
      data: comment,
    });
  } catch (error: any) {
    console.error("Error updating comment status:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ========================== ADMIN INVOICE =========================

// getInvoiceListing
export const getInvoiceListing = async (
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
    search: req.query.search ? (req.query.search as string) : undefined,
    supplier_id: req.query.supplier_id ? req.query.supplier_id : undefined,
    invoice_admin_status: req.query.invoice_admin_status
      ? req.query.invoice_admin_status
      : undefined,
  };

  const { error } = getOrdersValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetInvoiceListing(requestData, user);
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
    console.error("Error in get Invoice Listing:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Retrieve Invoice Listing.",
      error: err,
    });
  }
};

// getInvoiceDetail
export const getInvoiceDetail = async (
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

  const { order_id } = req.params;
  const orderDetail = await Order.findOne({
    where: { id: order_id },
    include: [
      {
        model: OrderSupplierItem,
        as: "items",
        required: false,
      },
      {
        model: OrderComment,
        as: "comments",
        required: false,
        where: { type: "invoice" },
        include: [
          {
            model: OrderComment,
            as: "replies",
            required: false,
          },
        ],
      },
      {
        model: OrderReceiving,
        as: "receivings",
        required: false,
        separate: true, // important for ordering included model
        order: [["created_at", "DESC"]], // order descending by created_at
      },
    ],
  });

  if (!orderDetail) {
    errorResponse(res, {
      statusCode: 404,
      message: "Invoice not found",
    });
  }
  try {
    const enrichedPO = await resolvePurchaseOrderRelations(
      orderDetail?.toJSON()
    );

    const enrichedOrder = {
      ...enrichedPO,
    };

    successResponse(res, {
      statusCode: 200,
      message: "Invoice fetched successfully",
      data: enrichedOrder,
    });
  } catch (error: any) {
    console.error("🔥 Sequelize query error:", error); // 👈 add this
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch invoice details",
      error: error.message || error,
    });
  }
};

// requestMultipleInvoiceSupplierItems
export const requestMultipleInvoiceSupplierItems = async (
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

  const { order_receiving_id, order_id } = req.params;

  if (!order_id) {
    errorResponse(res, {
      statusCode: 400,
      message: "order_id is required in params",
    });
    return;
  }

  try {
    // ✅ Step 1: Update all given supplier items
    await OrderReceiving.update(
      {
        supplier_invoice_status: "ready_for_invoice",
        invoice_requested: true,
      },
      {
        where: {
          id: order_receiving_id,
          order_id: order_id,
        },
      }
    );

    // ✅ Step 2: Fetch all items for this order
    const allItems = await OrderReceiving.findAll({
      where: { order_id },
    });

    // ✅ Step 3: Determine invoice readiness
    const allReady = allItems.every(
      (item) =>
        item.supplier_invoice_status === "ready_for_invoice" &&
        item.invoice_requested === true
    );

    const someReady = allItems.some(
      (item) =>
        item.supplier_invoice_status === "ready_for_invoice" &&
        item.invoice_requested === true
    );

    // ✅ Step 4: Update parent order status accordingly
    if (allReady) {
      await Order.update(
        { invoice_supplier_status: "fully_received_invoice_pending" },
        { where: { id: order_id } }
      );
    } else if (someReady) {
      await Order.update(
        { invoice_supplier_status: "partially_received_invoice_pending" },
        { where: { id: order_id } }
      );
    }

    successResponse(res, {
      statusCode: 200,
      message: "Invoice request processed successfully.",
      data: {
        updated_item_id: order_receiving_id,
        order_id,
      },
    });
  } catch (err) {
    console.error("Error in bulk invoice request:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to process invoice requests.",
      error: err,
    });
  }
};

export const updateOrderReceiving = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { order_id } = req.params;
    const { account_payable_date, account_payable_price, receipt_link } =
      req.body;

    const order = await OrderReceiving.findOne({ where: { order_id } });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Build update object dynamically
    const updateData: any = {};

    if (account_payable_date && account_payable_price) {
      updateData.account_payable_date = account_payable_date;
      updateData.account_payable_price = account_payable_price;
      updateData.is_paid = true;
    }

    if (receipt_link) {
      updateData.receipt_link = receipt_link;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    // ✅ Fix: Add the 'where' clause as the second argument
    await OrderReceiving.update(updateData, { where: { order_id } });

    // Optionally, fetch the updated record
    const updatedOrder = await OrderReceiving.findOne({ where: { order_id } });

    await Order.update(
      {
        invoice_admin_status: "paid",
        invoice_supplier_status:
          "fully_invoiced_payment_pending",
      },
      {
        where: {
          id: order_id,
        },
      }
    );

    res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
