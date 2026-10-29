import Joi, { bool } from "joi";

export const convertQuotationInOrderValidation = Joi.object({
  quotation_id: Joi.string().guid().required(),
}).required();

// createOrderValidation
export const createOrderValidation = Joi.object({
  status: Joi.string()
    .valid("draft", "pending", "approved", "rejected")
    .required(),
  notes: Joi.string().allow(null, "").optional(),
  shared_with: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.string().guid().required(),
        notes: Joi.string().allow(null, "").optional(),
      })
    )
    .optional(),

  attachments: Joi.array()
    .items(
      Joi.object({
        file_name: Joi.string().required(),
        file_url: Joi.string().uri().required(),
      })
    )
    .optional(),
});

export const getOrdersValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string(),
  subsidiary_branch_id: Joi.string(),
  branch_department_id: Joi.string(),

  admin_status: Joi.string()
    .valid(
      "pending_approval",
      "not_fulfilled",
      "delivered",
      "sent",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "supplier_accepted",
      "supplier_rejected",
      "draft"
    )
    .optional(),

  supplier_status: Joi.string()
    .valid(
      "pending",
      "accepted",
      "in_fulfilment",
      "delivered",
      "partially_delivered",
      "rejected"
    )
    .optional(),

  supplier_id: Joi.string().optional(),

  receiving_status: Joi.string()
    .valid(
      "awaiting_receipt",
      "pending",
      "received",
      "rejected",
      "partially_received",
      "awaiting_confirmation"
    )
    .optional(),

  invoice_admin_status: Joi.string()
    .valid(
      "pending_invoice",
      "rejected",
      "paid",
      "partially_paid",
      "unmatched_invoice",
      "pending_payment"
    )
    .optional(),
  invoice_admin_status_filter: Joi.boolean().optional(),
  invoice_supplier_status_filter: Joi.boolean().optional(),
  delivery_date: Joi.date().iso().optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

const itemSchema = Joi.object({
  id: Joi.string().required(),
  delivery_status: Joi.string()
    .valid("pending", "shipped", "delivered", "delayed")
    .optional(),
  quantity_delivered: Joi.number().optional(),
  admin_receive: Joi.number().optional(),
  admin_rejected: Joi.number().optional(),
  pending_delivery_quantity: Joi.number().optional(),
  rejection_message: Joi.string().optional(),
  receiving_status: Joi.string()
    .valid("received", "partially_received", "rejected")
    .optional(),
  admin_invoice_status: Joi.string()
    .valid("ready_for_invoice", "invoiced", "ready_for_billing")
    .optional(),
});

export const ReceivingItemsUpdate = Joi.object({
  order_id: Joi.string().required(),
  order_admin_invoice_status: Joi.string().valid("pending_invoice").optional(),
  org_currency_id: Joi.string().required(),
  deliver_at: Joi.date().iso().optional(),
  items: Joi.array().items(itemSchema).min(1).required(),
});

export const supplierLineItemReceiving = Joi.object({
  order_id: Joi.string().uuid().required(),
  currency: Joi.string().required(),
  order_admin_invoice_status: Joi.string().valid("pending_invoice").optional(),
  admin_invoice_status: Joi.string()
    .valid("ready_for_invoice", "invoiced", "ready_for_billing")
    .optional(),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().required(),
        quantity_delivered: Joi.number().optional(),
        admin_receive: Joi.number().optional(),
        admin_rejected: Joi.number().optional(),
        pending_delivery_quantity: Joi.number().optional(),
        rejection_message: Joi.string().allow("", null).optional(),
        receiving_status: Joi.string()
          .valid("received", "partially_received", "rejected")
          .optional(),
      })
    )
    .min(1)
    .required(),
});
