import { Op, Transaction, QueryTypes } from "sequelize";
import {
  generateInvoiceId,
  generateOrderId,
} from "../services/OrgSettingService";
import { resolvePurchaseOrderRelations } from "../services/OrderGrpcService";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import OrderSupplierLineItem from "../models/OrderSupplierItem";
import ShareOrder from "../models/ShareOrder";
import Order from "../models/Order";
import { getRequisitionById } from "../../grpc/clients/RequisitionGrpcClient";
import OrderSupplierItem from "../models/OrderSupplierItem";
import AppDataSource from "../../config/DatabaseSource";
import {
  getBranchById,
  getDepartmentById,
  getOrganizationById,
  getUserById,
} from "../../grpc/clients/AdminGrpcClient";
import { errorResponse, successResponse } from "../utils/general/ResponseUtils";
import OrderComment from "../models/OrderComment";
import { getSupplierById } from "../../grpc/clients/SupplierGrpcClient";
import { generateGRNId } from "../services/GrnService";
import { generateInvoiceNo } from "../services/InvoiceService";
import OrderReceiving from "../models/OrderReceiving";

export const executeConvertQuotationInOrder = async (
  quotationId: string,
  user: any,
  token: string,
  transaction: Transaction
) => {
  try {
    const organization_id = user?.organization_id;
    const created_by = user?.id;

    const findOrder = await Order.findOne({
      where: {
        quotation_id: String(quotationId),
        organization_id: organization_id,
      },
    });

    if (findOrder) {
      return {
        success: false,
        statusCode: 400,
        message: "Purchase Order already exists.",
      };
    }

    const order_id = await generateOrderId(user.organization_id, token);

    // Quotation Service Get Data Communication through Api
    const reqResponse: any = await http.get(
      `v1/supplier-selected/quotation-detail/${quotationId}`,
      undefined,
      {
        token,
        baseURL: service.QUOTATION_SERVICE_URL,
      }
    );
    console.log("QUOTATION RESPONSE:");
    console.dir(reqResponse?.data?.data, { depth: null });

    console.log("SUPPLIERS:");
    console.dir(reqResponse?.data?.data?.suppliers, { depth: null });

    console.log(
      "SELECTED SUPPLIER ID:",
      reqResponse?.data?.data?.suppliers?.[0]?.selected_supplier_id
    );

    if (!reqResponse?.data?.data) {
      throw new Error("Quotation details not found from service.");
    }

    const supplier = reqResponse?.data?.data?.suppliers?.[0];
    if (!supplier) {
      throw new Error("No supplier found for this quotation.");
    }

    const finalOrderData: any = {
      order_gen_id: String(order_id),
      quotation_id: String(quotationId),
      quote_id: String(reqResponse?.data?.data?.quote_id),
      requisition_id: String(reqResponse?.data?.data?.requisition_id),
      request_id: String(reqResponse?.data?.data?.request_id),
      organization_id: String(organization_id),
      subsidiary_id: String(reqResponse?.data?.data?.subsidiary_id),
      subsidiary_branch_id: String(
        reqResponse?.data?.data?.subsidiary_branch_id
      ),
      branch_department_id: String(
        reqResponse?.data?.data?.branch_department_id
      ),
      admin_status: 'pending_approval',
      selected_supplier_id: reqResponse?.data?.data?.selected_supplier_id,
      created_by: String(created_by),
      total_order_amount: supplier.total_supplier_amount,
      total_bid_amount: supplier.total_bid_amount,
      warranty: supplier.warranty,
      shipping_terms: reqResponse?.data?.data?.shipping_terms,
      payment_terms: reqResponse?.data?.data?.payment_terms,
      receiving_location: reqResponse?.data?.data?.receiving_location,
      supplier_delivery_date: supplier.supplier_delivery_date,
      budget_id: reqResponse?.data?.data?.budget_id,
      budget_item_id: reqResponse?.data?.data?.budget_item_id,
    };
    console.log("FINAL ORDER DATA:");
    console.dir(finalOrderData, { depth: null });

    const purchaseOrder = await Order.create(finalOrderData, { transaction });
    console.log("CREATED ORDER:");
    console.dir(purchaseOrder.toJSON(), { depth: null });

    const lineItems = supplier.line_items || [];
    const mappedLineItems = lineItems.map((item: any) => ({
      order_id: purchaseOrder.id,
      quotation_id: purchaseOrder.quotation_id,
      requisition_id: purchaseOrder.requisition_id,
      quotation_supplier_id: purchaseOrder.selected_supplier_id,
      item_name: item.item_name,
      ordered_quantity: item.quantity,
      org_currency_id: item.org_currency_id,
      unit_price: item.unit_price,
      discount_percentage: item.discount_percentage,
      delivery_fees: item.delivery_fees,
      tax_percentage: item.tax_percentage,
      total_amount: item.total_amount,
      delivery_status: item.delivery_status ?? "pending",
      org_category_id: item.org_category_id,
      organization_id: purchaseOrder.organization_id,
    }));

    const orderlineItems = await OrderSupplierItem.bulkCreate(mappedLineItems, {
      transaction,
    });

    // 🔔 Notify supplier about new rating
    try {
      await http.post(
        `/v1/notification/create`,
        {
          sender_id: user.id,
          receiver_id: reqResponse?.data?.data?.selected_supplier_id,
          organization_id: user.organization_id,
          subsidiary_id: finalOrderData.subsidiary_id ?? null,
          notification_type: "convert_quotation_to_purchase_order",
          notification_module: "purchase_order",
          message: `The Quotation ${finalOrderData.quote_id} has been converted into Purchase Order `,
        },
        {
          baseURL: service.NOTIFICATION_SERVICE_URL,
        }
      );
    } catch (err) {
      console.error("Notification failed:", err);
    }

    return {
      success: true,
      statusCode: 201,
      message: "Purchase Order created successfully.",
      data: {
        ...purchaseOrder.toJSON(),
        order_line_items: orderlineItems,
      },
    };
  } catch (error: any) {
    console.error("Error in executeConvertQuotationInOrder:", error);

    // rollback agar transaction pass kiya gaya hai
    if (transaction) {
      await transaction.rollback();
    }

    return {
      success: false,
      statusCode: 500,
      message: error?.message || "Something went wrong while creating order.",
    };
  }
};

// executeGetOrders
export const executeGetOrders = async (requestData: any, user: any) => {
  const {
    page,
    limit,
    organization_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
    admin_status,
    supplier_status,
    search,
    supplier_id,
    receiving_status,
    delivery_date,
    invoice_admin_status_filter,
    invoice_supplier_status_filter,
  } = requestData;

  const whereCondition: any = {
    organization_id,
  };

  // Supplier filter
  if (supplier_id) {
    whereCondition.selected_supplier_id = supplier_id;
    whereCondition.supplier_status = {
      ...(supplier_status ? { [Op.eq]: supplier_status } : {}),
      [Op.not]: null,
    };
  }

  // Receiving status filter
  if (receiving_status === "all") {
    whereCondition.receiving_status = { [Op.not]: null };
  } else if (receiving_status) {
    whereCondition.receiving_status = receiving_status;
  }

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
  if (admin_status) {
    if (Array.isArray(admin_status)) {
      whereCondition.admin_status = { [Op.in]: admin_status };
    } else {
      whereCondition.admin_status = admin_status;
    }
  }
  if (supplier_status) {
    whereCondition.supplier_status = supplier_status;
  }
  if (delivery_date) {
    whereCondition.supplier_delivery_date = delivery_date;
  }

  // Invoice Status NOT NULL Filters
  if (invoice_admin_status_filter === true) {
    whereCondition.invoice_admin_status = { [Op.not]: null };
  }

  if (invoice_supplier_status_filter === true) {
    whereCondition.invoice_supplier_status = { [Op.not]: null };
  }

  // Search filter
  if (search) {
    whereCondition[Op.or] = [{ order_id: { [Op.iLike]: `%${search}%` } }];
  }

  // Pagination
  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: whereCondition,
      offset,
      limit: Number(limit),
      order: [["created_at", "DESC"]],
      raw: true,
    });

    const enrichedData = await Promise.all(
      orders.map(resolvePurchaseOrderRelations)
    );

    return {
      success: true,
      statusCode: 200,
      message: "Purchase Orders Retrieved Successfully!",
      data: {
        data: enrichedData,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),

        summary: {
          total_orders: total,
          total_value: orders.reduce(
            (sum, order) => sum + (Number(order.total_order_amount) || 0),
            0
          ),
          pending_orders: orders.filter(
            (o) =>
              o.admin_status === "pending_approval" ||
              o.admin_status === "draft"
          ).length,
        },
      },
    };
  }

  // No pagination
  const orders = await Order.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    raw: true,
  });

  const enrichedData = await Promise.all(
    orders.map(resolvePurchaseOrderRelations)
  );

  return {
    success: true,
    statusCode: 200,
    message: "Purchase Orders Retrieved Successfully!",
    data: enrichedData,
  };
};

// executeGetReceivingListing
export const executeGetReceivingListing = async (
  requestData: any,
  user: any
) => {
  const {
    page,
    limit,
    organization_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
    search,
    supplier_id,
    receiving_status,
  } = requestData;

  const whereCondition: any = {
    organization_id,
    receiving_status: { [Op.not]: null }, // 👈 always exclude NULL receiving status
  };

  // Supplier filter
  if (supplier_id) {
    whereCondition.selected_supplier_id = supplier_id;
  }

  // Receiving status filter
  if (receiving_status) {
    whereCondition.receiving_status = receiving_status;
  }

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

  // Search filter
  if (search) {
    whereCondition[Op.or] = [{ order_id: { [Op.iLike]: `%${search}%` } }];
  }

  // Pagination
  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: whereCondition,
      offset,
      limit: Number(limit),
      order: [["created_at", "DESC"]],
      raw: true,
    });

    const enrichedData = await Promise.all(
      orders.map(resolvePurchaseOrderRelations)
    );

    const itemsReceived = orders.filter(
      (o) => o.receiving_status === "received"
    ).length;
    const pendingDeliveries = orders.filter(
      (o) => o.receiving_status === "pending"
    ).length;
    const deliveryDiscrepancies = orders.filter(
      (o) => o.invoice_admin_status === "unmatched_invoice"
    ).length;

    return {
      success: true,
      statusCode: 200,
      message: "Receiving Retrieved Successfully!",
      data: {
        data: enrichedData,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),

        summary: {
          items_received: itemsReceived,
          pending_deliveries: pendingDeliveries,
          delivery_discrepancies: deliveryDiscrepancies,
          total_value: orders.reduce(
            (sum, order) => sum + (Number(order.total_order_amount) || 0),
            0
          ),
        },
      },
    };
  }

  // No pagination
  const orders = await Order.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    raw: true,
  });

  const enrichedData = await Promise.all(
    orders.map(resolvePurchaseOrderRelations)
  );

  return {
    success: true,
    statusCode: 200,
    message: "Receiving Retrieved Successfully!",
    data: enrichedData,
  };
};

export const executeGetOrderDetail = async (id: string) => {
  const orderDetail = await Order.findOne({
    where: { id },
    include: [
      {
        model: ShareOrder,
        as: "shared_users",
      },
      {
        model: OrderSupplierItem,
        as: "items",
      },
      {
        model: OrderComment,
        as: "comments",
        where: { type: "order" },
        required: false,
        include: [
          {
            model: OrderComment,
            as: "replies",
            required: false, // nested replies (child comments)
          },
        ],
      },
    ],
  });

  if (!orderDetail) {
    return {
      success: false,
      statusCode: 404,
      message: "Purchase Order not found",
    };
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

    let orderContract = null;

    const contractData = await AppDataSource.query(
      `
  SELECT *
  FROM order_contracts
  WHERE purchase_order_id = :purchaseOrderId
  LIMIT 1
  `,
      {
        replacements: {
          purchaseOrderId: id,
        },
        type: QueryTypes.SELECT,
      }
    );

    orderContract = contractData?.[0] || null;

    const enrichedOrder = {
      ...enrichedPO,
      supplier_details: supplierDetails,
      order_contract: orderContract,
    };

    return {
      success: true,
      statusCode: 200,
      message: "Order detail retrieved successfully",
      data: enrichedOrder,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch quotation from requisition service",
      error: error?.message || error,
    };
  }
};

// executeUpdateOrderStatus
export const executeUpdateOrderStatus = async (
  id: string,
  admin_status: string,
  supplier_status: string,
  receiving_status: string,
  invoice_supplier_status: string,
  invoice_admin_status: string,
  updated_by: string,
  attachments?: any[],
  user?: any
) => {
  const order = await Order.findOne({
    where: { id },
  });

  if (!order) {
    return {
      success: false,
      statusCode: 404,
      message: "Order not found",
    };
  }
  const updatePayload: any = {
    admin_status: admin_status,
    supplier_status: supplier_status,
    receiving_status: receiving_status,
    invoice_supplier_status: invoice_supplier_status,
    invoice_admin_status: invoice_admin_status,
    last_action_by: updated_by,
  };

  if (attachments !== undefined) {
    updatePayload.attachments = attachments;
  }

  await order.update(updatePayload);

  try {
    if (order.quotation_id) {
      const [quotation]: any = await AppDataSource.query(
        `
      SELECT
        id,
        quote_id,
        created_by,
        selected_supplier_id
      FROM quotations
      WHERE id = :quotationId
      LIMIT 1
      `,
        {
          replacements: {
            quotationId: order.quotation_id,
          },
          type: QueryTypes.SELECT,
        }
      );

      if (quotation) {
        const employeeId = quotation.created_by;
        const vendorId = quotation.selected_supplier_id;

        let receiverId: string | null = null;
        let notificationType = "order_status";
        let message = "";

        // --------------------
        // ADMIN -> EMPLOYEE
        // --------------------
        if (
          ["approved", "rejected"].includes(admin_status)
        ) {
          receiverId = employeeId;
          message = `Order ${order.order_gen_id} has been ${admin_status} by admin.`;
        }

        // --------------------
        // EMPLOYEE -> VENDOR
        // --------------------
        else if (
          ["sent", "signed"].includes(admin_status)
        ) {
          receiverId = vendorId;
          message = `Order ${order.order_gen_id} has been ${admin_status}.`;
        }

        // --------------------
        // VENDOR -> EMPLOYEE
        // --------------------
        else if (
          [
            "accepted",
            "rejected",
            "signed",
            "delivered",
            "partially_delivered",
            "in_fulfilment",
          ].includes(supplier_status)
        ) {
          receiverId = employeeId;
          message = `Vendor updated order ${order.order_gen_id} status to ${supplier_status}.`;
        }

        // --------------------
        // RECEIVING -> EMPLOYEE
        // --------------------
        else if (
          [
            "received",
            "rejected",
            "partially_received",
          ].includes(receiving_status)
        ) {
          receiverId = employeeId;
          message = `Receiving status for order ${order.order_gen_id} updated to ${receiving_status}.`;
        }

        // --------------------
        // ADMIN -> VENDOR
        // --------------------
        else if (
          [
            "rejected",
            "paid",
            "partially_paid",
          ].includes(invoice_admin_status)
        ) {
          receiverId = vendorId;
          message = `Invoice status for order ${order.order_gen_id} updated to ${invoice_admin_status}.`;
        }

        // --------------------
        // VENDOR -> EMPLOYEE
        // --------------------
        else if (
          [
            "fully_invoiced_paid",
            "partially_invoiced_paid",
          ].includes(invoice_supplier_status)
        ) {
          receiverId = employeeId;
          message = `Vendor updated invoice status for order ${order.order_gen_id} to ${invoice_supplier_status}.`;
        }

        if (receiverId) {
          console.log(
            "🔔 Sending order notification",
            {
              sender: user.id,
              receiver: receiverId,
              message,
            }
          );

          await http.post(
            "/v1/notification/create",
            {
              sender_id: user.id,
              receiver_id: receiverId,
              organization_id: order.organization_id,
              subsidiary_id: order.subsidiary_id || null,
              notification_type: notificationType,
              notification_module: "purchase_order",
              message,
            },
            {
              baseURL: service.NOTIFICATION_SERVICE_URL,
            }
          );

          console.log("✅ Notification sent");
        }
      }
    }
  } catch (error: any) {
    console.error(
      "❌ Order notification failed:",
      error?.response?.data || error.message
    );
  }

  return {
    success: true,
    statusCode: 200,
    message: "Order status updated successfully",
  };
};

// executeStatusOrderSupplierLineItem
export const executeStatusOrderSupplierLineItem = async (
  order_id: string,
  currency: string,
  items: Array<{
    id: string;
    quantity_delivered?: number;
    admin_receive?: number;
    admin_rejected?: number;
    pending_delivery_quantity?: number;
    rejection_message?: string;
    receiving_status?: "received" | "partially_received" | "rejected";
  }>,
  user: any,
  order_admin_invoice_status?: "pending_invoice",
  admin_invoice_status?: "ready_for_invoice" | "invoiced" | "ready_for_billing"
) => {
  try {
    const updatedItems = [];

    // ✅ Loop through each item to update individually
    for (const item of items) {
      const orderLineItem = await OrderSupplierItem.findOne({
        where: { id: item.id },
      });

      if (!orderLineItem) {
        console.warn(`⚠️ Item not found: ${item.id}`);
        continue; // Skip missing item
      }

      // ✅ Update order supplier line item
      await orderLineItem.update({
        quantity_delivered: item.quantity_delivered,
        admin_receive: item.admin_receive,
        admin_rejected: item.admin_rejected,
        pending_delivery_quantity: item.pending_delivery_quantity,
        rejection_message: item.rejection_message,
        receiving_status: item.receiving_status,
        // admin_invoice_status: item.admin_invoice_status,
      });

      updatedItems.push(orderLineItem);
    }
    // ✅ Update parent Order if invoice pending
    if (order_admin_invoice_status === "pending_invoice") {
      await Order.update(
        { invoice_admin_status: "pending_invoice" },
        { where: { id: order_id } }
      );
    }

    const order = await Order.findOne({
      where: { id: order_id },
    });
    if (!order) {
      return {
        success: false,
        statusCode: 404,
        message: "Order not found",
      };
    }

    const grnItems = updatedItems.map((item) => {
      const unit = "Box";
      const quantity = item.admin_receive || 0;
      const price = item.unit_price || 0;
      const amount = quantity * price;
      const budget_id = item.budget_id;
      const budget_item_id = item.budget_item_id;

      return {
        item_name: item.item_name,
        unit,
        quantity,
        price,
        amount,
        budget_id,
        budget_item_id,
      };
    });

    const sub_total = grnItems.reduce((sum, i) => sum + i.amount, 0);
    const vat = sub_total * 0.075; // example 7.5%
    const shipping = 12000; // placeholder
    const discount = 12500; // placeholder
    const total_amount = sub_total + vat + shipping - discount;

    const grnId = await generateGRNId();
    await OrderReceiving.create({
      order_id: order.id,
      order_gen_id: order.order_gen_id,
      admin_invoice_status: admin_invoice_status,
      quotation_id: order.quotation_id,
      quote_id: order.quote_id,
      requisition_id: order.requisition_id,
      request_id: order.request_id,
      organization_id: order.organization_id,
      currency: currency,
      supplier_id: order.selected_supplier_id,
      ship_to_user_id: user.id,
      received_user_id: user.id,
      grn_gen_id: grnId,
      date_issued: new Date(),
      delivery_date: new Date(),
      sub_total: sub_total,
      vat: vat,
      shipping: shipping,
      discount: discount,
      total_amount: total_amount,
      grn_items: grnItems,
      is_3way: false,
      is_paid: false,
      grn_status: "pending",
    });

    // ✅ Return final response
    return {
      success: true,
      statusCode: 200,
      message: "All items processed successfully",
      data: updatedItems,
    };
  } catch (error) {
    console.error("❌ Error updating order supplier items:", error);
    return {
      success: false,
      statusCode: 500,
      message: "An error occurred while updating items",
      error,
    };
  }
};

// =================== vendor ======================
export const executeGetPO = async (
  supplierId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string,
  requisitionTitle?: string,
  totalAmountFrom?: number,
  totalAmountTo?: number,
  supplierDeliveryDate?: string
) => {

  const whereCondition: any = {
    selected_supplier_id: supplierId,
    supplier_status: { [Op.ne]: null },
  };

  if (status) {
    whereCondition.supplier_status = status;
  }

  if (
    totalAmountFrom !== undefined &&
    totalAmountTo !== undefined
  ) {
    whereCondition.total_order_amount = {
      [Op.between]: [totalAmountFrom, totalAmountTo],
    };
  } else if (totalAmountFrom !== undefined) {
    whereCondition.total_order_amount = {
      [Op.gte]: totalAmountFrom,
    };
  } else if (totalAmountTo !== undefined) {
    whereCondition.total_order_amount = {
      [Op.lte]: totalAmountTo,
    };
  }

  if (supplierDeliveryDate) {
    whereCondition.supplier_delivery_date = supplierDeliveryDate;
  }

  // 🔹 Count total records first
  const totalCount = await Order.count({
    where: whereCondition,
  });

  // 🔹 Apply pagination
  const orders = await Order.findAll({
    where: whereCondition,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    order: [["created_at", "DESC"]],
  });

  const paymentReceivedCount = await OrderReceiving.count({
    where: {
      supplier_id: supplierId,
      is_paid: true,
    },
  });

  // 🔹 Payment Due Count
  const paymentDueCount = await OrderReceiving.count({
    where: {
      supplier_id: supplierId,
      is_paid: false,
    },
  });

  if (!orders.length) {
    return {
      success: true,
      statusCode: 200,
      message: "No Place Orders found",
      data: {
        orders: [],
        summary: {
          total_orders: totalCount,
          payment_received_count: paymentReceivedCount,
          payment_due_count: paymentDueCount,
        },
      },
    };
  }

  // 🔹 Enrich orders
  const enrichedOrders = await Promise.all(
    orders.map(async (order: any) => {
      let requisitionData: any = null;
      let organizationData = null;
      let supplierItems: OrderSupplierItem[] = [];
      if (order.requisition_id) {
        try {
          requisitionData = await getRequisitionById(
            order.requisition_id.toString()
          );
        } catch (err) {
          console.error("Error fetching requisition via gRPC:", err);
        }
      }

      if (
        requisitionTitle &&
        !requisitionData?.title
          ?.toLowerCase()
          .includes(requisitionTitle.toLowerCase())
      ) {
        return null;
      }

      if (order.organization_id) {
        try {
          organizationData = await getOrganizationById(
            order.organization_id.toString()
          );
        } catch (err) {
          console.error("Error fetching organization via gRPC:", err);
        }
      }

      let branch = null;
      if (order.subsidiary_branch_id) {
        branch = await getBranchById(order.subsidiary_branch_id);
      }

      let department = null;
      if (order.branch_department_id) {
        department = await getDepartmentById(order.branch_department_id);
      }

      if (order.quotation_id) {
        try {
          supplierItems = await OrderSupplierItem.findAll({
            where: { quotation_id: order.quotation_id },
          });
        } catch (err) {
          console.error("Error fetching supplier items:", err);
        }
      }

      return {
        ...order.toJSON(),
        requisition: requisitionData,
        organization: organizationData,
        supplier_items: supplierItems,
        branch,
        department,
      };
    })
  );

  return {
    success: true,
    statusCode: 200,
    message: "Place Order fetched successfully",
    data: {
      data: enrichedOrders,
      summary: {
        total_orders: totalCount,
        payment_received_count: paymentReceivedCount,
        payment_due_count: paymentDueCount,
      },
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

export const executeGetAllPO = async (
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    const orders = await Order.findAll({
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [["created_at", "DESC"]], // latest first
    });

    return {
      success: true,
      statusCode: 200,
      message: "All Purchase Orders retrieved successfully",
      data: orders,
    };
  } catch (error: any) {
    console.error("Error fetching all POs:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch all Purchase Orders",
    };
  }
};

export const executeUpdateSupplierStatus = async (
  orderId: string,
  newStatus: string,
  user?: any,
  token?: string
) => {
  // allowed statuses (as per enum)
  const allowedStatuses = ["accepted", "rejected"];

  if (!allowedStatuses.includes(newStatus)) {
    return {
      success: false,
      status_code: 400,
      message: "Invalid supplier_status value",
    };
  }

  const order = await Order.findByPk(orderId);

  if (!order) {
    return {
      success: false,
      status_code: 404,
      message: "Order not found",
    };
  }

  order.supplier_status = newStatus as any;
  await order.save();

  try {
    const quotationResult: any = await AppDataSource.query(
      `
      SELECT created_by, quote_id
      FROM quotations
      WHERE id = :quotationId
      LIMIT 1
      `,
      {
        replacements: {
          quotationId: order.quotation_id,
        },
        type: QueryTypes.SELECT,
      }
    );

    const quotation = quotationResult?.[0];

    if (quotation?.created_by) {

      await http.post(
        "/v1/notification/create",
        {
          sender_id: user.id,
          receiver_id: quotation.created_by,
          organization_id: user.organization_id,
          subsidiary_id: null,
          notification_type: "supplier_status_updated",
          notification_module: "purchase_order",
          message:
            newStatus === "accepted"
              ? `Vendor accepted invoice/order for quotation ${quotation.quote_id}.`
              : `Vendor rejected invoice/order for quotation ${quotation.quote_id}.`,
        },
        {
          baseURL: service.NOTIFICATION_SERVICE_URL,
          token,
        }
      );

      console.log(
        `✅ Notification sent to employee ${quotation.created_by}`
      );
    }
  } catch (error: any) {
    console.error(
      "❌ Failed to send notification:",
      error?.response?.data || error?.message
    );
  }

  return {
    success: true,
    status_code: 200,
    message: "Supplier status updated successfully",
    data: order,
  };
};

export const executeUpdateSupplierItems = async (
  quotationId: string,
  items: { id: string; delivery_status: string }[]
) => {
  try {
    // Check items exist against quotationId
    const existingItems = await OrderSupplierItem.findAll({
      where: { quotation_id: quotationId },
    });

    if (!existingItems.length) {
      return {
        success: false,
        statusCode: 404,
        message: "No supplier items found for this quotation_id",
      };
    }

    // Update each item
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const row = await OrderSupplierItem.findOne({
          where: { id: item.id, quotation_id: quotationId },
        });

        if (!row) return null;

        row.delivery_status = item.delivery_status as
          | "pending"
          | "delivered"
          | "shipped"
          | "delayed"
          | null;

        await row.save();

        return row;
      })
    );

    return {
      success: true,
      statusCode: 200,
      message: "Supplier items updated successfully",
      data: updatedItems.filter((i) => i !== null),
    };
  } catch (error) {
    console.error("Error updating supplier items:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Something went wrong while updating supplier items",
    };
  }
};

// Invoices on vendor side
export const executeGetSupplierInvoiceItems = async (
  supplierId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  try {
    // Calculate offset
    const offset = (page - 1) * pageSize;

    // 1️⃣ Fetch orders with pagination
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: {
        selected_supplier_id: supplierId,
        invoice_supplier_status: { [Op.ne]: null },
      },
      limit: pageSize,
      offset,
      order: [["created_at", "DESC"]], // optional: latest first
    });

    if (!orders.length) {
      return {
        success: true,
        statusCode: 200,
        message: "No Invoices found for this supplier",
        data: [],
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }

    // 2️⃣ Enrich each order
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const supplierItems = await OrderReceiving.findAll({
          where: {
            quotation_id: order.quotation_id,
            invoice_requested: true,
          },
        });

        // Requisition via gRPC
        let requisition: any = null;
        let createdByUser: any = null;

        if (order.requisition_id) {
          try {
            requisition = await getRequisitionById(
              order.requisition_id.toString()
            );

            // agar requisition mila hai aur usme created_by hai
            if (requisition?.created_by) {
              createdByUser = await getUserById(requisition.created_by);
            }
          } catch (err) {
            console.error(
              `Error fetching requisition ${order.requisition_id}:`,
              err
            );
          }
        }

        // Organization via gRPC
        let organization = null;
        if (order.organization_id) {
          try {
            organization = await getOrganizationById(order.organization_id);
          } catch (err) {
            console.error(
              `Error fetching organization ${order.organization_id}:`,
              err
            );
          }
        }

        // Branch via gRPC
        let branch = null;
        if (order.subsidiary_branch_id) {
          branch = await getBranchById(order.subsidiary_branch_id);
        }

        // Branch via gRPC
        let department = null;
        if (order.branch_department_id) {
          console.log(
            "Fetching department for ID:",
            order.branch_department_id
          );
          department = await getDepartmentById(order.branch_department_id);
        }

        return {
          ...order.toJSON(),
          supplierItems,
          requisition,
          createdByUser,
          organization,
          branch,
          department,
        };
      })
    );

    return {
      success: true,
      statusCode: 200,
      message: "Vendor Invoices fetched successfully",
      data: enrichedOrders,
    };
  } catch (error) {
    console.error("Error fetching supplier invoice items:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Something went wrong while fetching supplier invoice items",
    };
  }
};

export const executeUpdateSupplierInvoiceStatus = async (
  id: string,
  supplier_invoice_status: "invoiced" | "ready_for_billing" | null,
  token: string // 👈 ye controller se aayega
) => {
  try {
    const item = await OrderReceiving.findByPk(id);

    if (!item) {
      return {
        success: false,
        statusCode: 404,
        message: "OrderSupplierItem not found",
      };
    }

    // ✅ agar status "invoiced" ho raha hai, to invoice_id generate karo
    if (supplier_invoice_status === "invoiced") {
      const invoice_id = await generateInvoiceId(item.organization_id, token);
      item.invoice_gen_id = invoice_id;
    }

    item.supplier_invoice_status = supplier_invoice_status;
    await item.save();

    return {
      success: true,
      statusCode: 200,
      message: "Invoice updated successfully",
      data: item,
    };
  } catch (error: any) {
    console.error("Error updating supplier invoice status:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Something went wrong while updating supplier invoice status",
      error: error.message || error,
    };
  }
};

//generate Invoice and grn

// ============================== backoffice ========================
export const executeGetOrganizationOrder = async (organization_id: string) => {
  try {
    const quotations = await Order.findAll({
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

// ============================ Admin Invoice functions =============================
export const executeGetInvoiceListing = async (requestData: any, user: any) => {
  const {
    page,
    limit,
    organization_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
    search,
    supplier_id,
    invoice_admin_status,
  } = requestData;

  const whereCondition: any = {
    organization_id,
    invoice_admin_status: { [Op.not]: null }, // 👈 always exclude NULL receiving status
  };

  // Supplier filter
  if (supplier_id) {
    whereCondition.selected_supplier_id = supplier_id;
  }

  // Receiving status filter
  if (invoice_admin_status) {
    whereCondition.invoice_admin_status = invoice_admin_status;
  }
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

  // Search filter
  if (search) {
    whereCondition[Op.or] = [{ order_id: { [Op.iLike]: `%${search}%` } }];
  }

  // Pagination
  if (page && limit) {
    const offset = (Number(page) - 1) * Number(limit);
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: whereCondition,
      offset,
      limit: Number(limit),
      order: [["created_at", "DESC"]],
      raw: true,
    });

    const enrichedData = await Promise.all(
      orders.map(resolvePurchaseOrderRelations)
    );

    const processedInvoice = orders.filter(
      (o) => o.invoice_admin_status === "pending_invoice"
    ).length;
    const pendingApprovalInvoice = orders.filter(
      (o) => o.admin_status === "pending_approval"
    ).length;
    const mismatchedInvoice = orders.filter(
      (o) => o.invoice_admin_status === "unmatched_invoice"
    ).length;

    return {
      success: true,
      statusCode: 200,
      message: "Admin Invoices Retrieved Successfully!",
      data: {
        data: enrichedData,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        summary: {
          processed_invoices: processedInvoice,
          pending_approval_invoices: pendingApprovalInvoice,
          mismatched_invoices: mismatchedInvoice,
        },
      },
    };
  }

  // No pagination
  const orders = await Order.findAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    raw: true,
  });

  const enrichedData = await Promise.all(
    orders.map(resolvePurchaseOrderRelations)
  );

  return {
    success: true,
    statusCode: 200,
    message: "Admin Invoices Retrieved Successfully!",
    data: enrichedData,
  };
};
