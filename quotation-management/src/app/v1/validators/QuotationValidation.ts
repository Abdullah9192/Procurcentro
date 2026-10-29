import Joi from "joi";

export const createRequisitionQuotationValidation = Joi.object({
  requisition_id: Joi.string().uuid().required(),
  request_id: Joi.string().required(),
  shipping_terms: Joi.string().optional().allow(null),
  payment_terms: Joi.string().optional().allow(null),
  response_due_date: Joi.date().optional().allow(null),
  attachments: Joi.array()
    .items(
      Joi.object({
        file_url: Joi.string().uri().required(),
        file_name: Joi.string().required(),
      })
    )
    .optional(),
  requisition_title: Joi.string().required(),
  requisition_date: Joi.date().required(),
  priority: Joi.string().required(),
  expected_delivery_date: Joi.date().optional().allow(null),
  receiving_location: Joi.string().required(),
  subsidiary_id: Joi.string().uuid().optional().allow(null),
  subsidiary_branch_id: Joi.string().uuid().optional().allow(null),
  branch_department_id: Joi.string().uuid().optional().allow(null),
  selected_supplier_id: Joi.string().uuid().optional().allow(null),
  scoring_configuration_type: Joi.string().valid("default", "split", "composite").default("default"),
  approval_workflow_id: Joi.string().uuid().optional().allow(null),
  type: Joi.string().valid("item", "service").required(),
  enable_bidding: Joi.boolean().default(false),
  bid_type: Joi.string().valid("open", "closed").optional().allow(null),
  bid_start_date: Joi.date().optional().allow(null),
  bid_end_date: Joi.date().optional().allow(null),
  bid_min_percent: Joi.number().precision(2).optional().allow(null),
  bid_max_percent: Joi.number().precision(2).optional().allow(null),
  last_action_by: Joi.string().uuid().optional().allow(null),
  total_quotation_amount: Joi.number().precision(2).required(),
  items: Joi.array()
    .items(
      Joi.object({
        item_name: Joi.string().required(),
        org_category_id: Joi.string().uuid().required(),
        budget_id: Joi.string().uuid().required(),
        budget_item_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().positive().required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        unit_price: Joi.number().precision(2).required(),
        org_currency_id: Joi.string().uuid().required(),
        comment: Joi.string().optional().allow(null),
        frequency: Joi.string().optional().allow(null),
        start_date: Joi.date().optional().allow(null),
        end_date: Joi.date().optional().allow(null),
        total_price: Joi.number().precision(2).required(),
        attachments: Joi.array()
          .items(
            Joi.object({
              file_url: Joi.string().uri().required(),
              file_name: Joi.string().required(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .required(),

  suppliers: Joi.array()
    .items(
      Joi.object({
        supplier_id: Joi.string().uuid().required(),
        subsidiary_id: Joi.string().uuid().optional().allow(null),
        subsidiary_branch_id: Joi.string().uuid().optional().allow(null),
        branch_department_id: Joi.string().uuid().optional().allow(null),
        organization_id: Joi.string().uuid().required(),
        supplier_delivery_date: Joi.date().optional().allow(null),
        warranty: Joi.string().optional().allow(null),
        total_supplier_amount: Joi.number().precision(2).optional().allow(null),
        total_bid_amount: Joi.number().precision(2).optional().allow(null),

        supplier_status: Joi.string()
          .valid(
            "pending_response",
            "sent",
            "in_negotiation",
            "in_revision",
            "approved",
            "completed",
            "rejected",
            "draft"
          )
          .optional()
          .allow(null),

        bid_status: Joi.string()
          .valid("sent", "withdrawn")
          .optional()
          .allow(null),
        bid_date_time: Joi.date().optional().allow(null),
        comments: Joi.string().optional().allow(null),

        // Negotiation fields
        negotiate_price: Joi.number().precision(2).optional().allow(null),
        negotiate_delivery_date: Joi.date().optional().allow(null),
        negotiate_delivery_days: Joi.number().integer().optional().allow(null),
        negotiate_warranty: Joi.string().optional().allow(null),
        negotiate_notes: Joi.string().optional().allow(null),
        negotiate_status: Joi.string()
          .valid("pending", "accepted", "rejected")
          .optional()
          .allow(null),

        // Supplier line items
        line_items: Joi.array()
          .items(
            Joi.object({
              quotation_item_id: Joi.string().uuid().required(),
              item_name: Joi.string().required(),
              org_currency_id: Joi.string().uuid().required(),
              unit_price: Joi.number().precision(2).required(),
              quantity: Joi.number().integer().positive().required(),
              discount_percentage: Joi.number()
                .precision(2)
                .optional()
                .allow(null),
              delivery_fees: Joi.number().precision(2).optional().allow(null),
              tax_percentage: Joi.number().precision(2).optional().allow(null),
              total_amount: Joi.number().precision(2).required(),
              org_category_id: Joi.string().uuid().required(),
              notes: Joi.string().optional().allow(null),

              // Attachments inside line items
              attachments: Joi.array()
                .items(
                  Joi.object({
                    file_url: Joi.string().uri().required(),
                    file_name: Joi.string().required(),
                  })
                )
                .optional(),
            })
          )
          .optional(),

        // Attachments at supplier level
        attachments: Joi.array()
          .items(
            Joi.object({
              file_url: Joi.string().uri().required(),
              file_name: Joi.string().required(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .required(),
});

export const getQuotationsValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string(),
  subsidiary_branch_id: Joi.string(),
  branch_department_id: Joi.string(),
  status: Joi.alternatives().try(
    Joi.string().valid(
      "pending_approval",
      "pending_response",
      "received",
      "supplier_approved",
      "in_negotiation",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "draft"
    ),
    Joi.array().items(
      Joi.string().valid(
        "pending_approval",
        "pending_response",
        "received",
        "supplier_approved",
        "in_negotiation",
        "in_revision",
        "approved",
        "completed",
        "rejected",
        "draft"
      )
    )
  )
    .optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

const itemSupplierValidation = Joi.object({
  quotation_id: Joi.string().required(),
  requisition_id: Joi.string().allow(null, ""),
  external_requisition_line_item_id: Joi.string().allow(null, ""),
  item_name: Joi.string().optional().allow(null, ""),
  quantity: Joi.number().optional().allow(null),
  org_currency_id: Joi.string().optional().allow(null),
  unit_price: Joi.number(),
  discount_percentage: Joi.number().allow(null),
  delivery_fees: Joi.number().allow(null),
  tax_percentage: Joi.number().allow(null),
  total_amount: Joi.number().allow(null),
  organization_id: Joi.string().required(),
  org_category_id: Joi.string().guid().required(),
  delivery_status: Joi.string()
    .valid("pending", "shipped", "delivered", "delayed")
    .allow(null),
}).required();

const attachmentValidation = Joi.object({
  quotation_id: Joi.string().required(),
  requisition_id: Joi.string().required(),
  file_name: Joi.string().optional().allow(null, ""),
  file_url: Joi.string().optional().allow(null, ""),
});

const comments = Joi.object({
  quotation_id: Joi.string().required(),
  content: Joi.string().required(),
  organization_id: Joi.string().required(),
});

export const addSupplierQuotationValidation = Joi.object({
  quotation_id: Joi.string().required(),
  subsidiary_id: Joi.string().allow(null, ""),
  subsidiary_branch_id: Joi.string().allow(null, ""),
  branch_department_id: Joi.string().allow(null, ""),
  organization_id: Joi.string().required(),
  supplier_delivery_date: Joi.date().iso().allow(null),
  warranty: Joi.string().allow(null, ""),
  total_supplier_amount: Joi.number().allow(null),
  total_bid_amount: Joi.number().allow(null),
  item_suppliers: Joi.array().items(itemSupplierValidation).min(1).allow(null),
  attachments: Joi.array().items(attachmentValidation).allow(null),
  comments: Joi.array().items(comments).allow(null),
}).required();

export const updateQuotationStatusValidation = Joi.object({
  status: Joi.string()
    .valid(
      "pending_approval",
      "pending_supplier_response",
      "sent_received",
      "in_negotiation",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "draft"
    )
    .required(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).optional(),
}).required();

// New Api's Validations
export const createQuotationSchema = Joi.object({
  requisition_id: Joi.string().uuid().optional(),
  request_id: Joi.string().optional(),
  shipping_terms: Joi.string().optional().allow(null),
  payment_terms: Joi.string().optional().allow(null),
  response_due_date: Joi.date().optional().allow(null),
  attachments: Joi.array()
    .items(
      Joi.object({
        file_url: Joi.string().uri().required(),
        file_name: Joi.string().required(),
      })
    )
    .optional(),
  requisition_title: Joi.string().required(),
  requisition_date: Joi.date().optional().allow(null),
  priority: Joi.string().required(),
  expected_delivery_date: Joi.date().optional().allow(null),
  receiving_location: Joi.string().required(),
  subsidiary_id: Joi.string().uuid().optional().allow(null),
  subsidiary_branch_id: Joi.string().uuid().optional().allow(null),
  branch_department_id: Joi.string().uuid().optional().allow(null),
  selected_supplier_id: Joi.string().uuid().optional().allow(null),
  scoring_configuration_type: Joi.string()
    .valid("default", "split", "composite")
    .default("default"),
  approval_workflow_id: Joi.string().uuid().optional().allow(null),
  type: Joi.string().valid("item", "service").required(),
  enable_bidding: Joi.boolean().default(false),
  bid_type: Joi.string().valid("open", "closed").optional().allow(null),
  bid_start_date: Joi.date().optional().allow(null),
  bid_end_date: Joi.date().optional().allow(null),
  bid_min_percent: Joi.number().precision(2).optional().allow(null),
  bid_max_percent: Joi.number().precision(2).optional().allow(null),
  last_action_by: Joi.string().uuid().optional().allow(null),
  total_quotation_amount: Joi.number().precision(2).required(),
  items: Joi.array()
    .items(
      Joi.object({
        item_name: Joi.string().required(),
        org_category_id: Joi.string().uuid().required(),
        item_image: Joi.string().uri().optional().allow(null),
        category_name: Joi.string().required(),
        unit: Joi.string().required(),
        budget_id: Joi.string().uuid().required(),
        budget_item_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().positive().required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        unit_price: Joi.number().precision(2).required(),
        org_currency_id: Joi.string().uuid().required(),
        comment: Joi.string().optional().allow(null),
        frequency: Joi.string().optional().allow(null),
        start_date: Joi.date().optional().allow(null),
        end_date: Joi.date().optional().allow(null),
        total_price: Joi.number().precision(2).required(),
        attachments: Joi.array()
          .items(
            Joi.object({
              file_url: Joi.string().uri().required(),
              file_name: Joi.string().required(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .required(),

  suppliers: Joi.array()
    .items(
      Joi.object({
        supplier_id: Joi.string().uuid().required(),
        subsidiary_id: Joi.string().uuid().optional().allow(null),
        subsidiary_branch_id: Joi.string().uuid().optional().allow(null),
        branch_department_id: Joi.string().uuid().optional().allow(null),
        organization_id: Joi.string().uuid().required(),
        supplier_delivery_date: Joi.date().optional().allow(null),
        warranty: Joi.string().optional().allow(null),
        total_supplier_amount: Joi.number().precision(2).optional().allow(null),
        total_bid_amount: Joi.number().precision(2).optional().allow(null),

        supplier_status: Joi.string()
          .valid(
            "pending_response",
            "sent",
            "in_negotiation",
            "in_revision",
            "approved",
            "completed",
            "rejected",
            "draft"
          )
          .optional()
          .allow(null),

        bid_status: Joi.string()
          .valid("sent", "withdrawn")
          .optional()
          .allow(null),
        bid_date_time: Joi.date().optional().allow(null),
        comments: Joi.string().optional().allow(null),

        // Negotiation fields
        negotiate_price: Joi.number().precision(2).optional().allow(null),
        negotiate_delivery_date: Joi.date().optional().allow(null),
        negotiate_delivery_days: Joi.number().integer().optional().allow(null),
        negotiate_warranty: Joi.string().optional().allow(null),
        negotiate_notes: Joi.string().optional().allow(null),
        negotiate_status: Joi.string()
          .valid("pending", "accepted", "rejected")
          .optional()
          .allow(null),

        // Supplier line items
        line_items: Joi.array()
          .items(
            Joi.object({
              quotation_item_id: Joi.string().uuid().required(),
              item_name: Joi.string().required(),
              org_currency_id: Joi.string().uuid().required(),
              unit_price: Joi.number().precision(2).required(),
              quantity: Joi.number().integer().positive().required(),
              discount_percentage: Joi.number()
                .precision(2)
                .optional()
                .allow(null),
              delivery_fees: Joi.number().precision(2).optional().allow(null),
              tax_percentage: Joi.number().precision(2).optional().allow(null),
              total_amount: Joi.number().precision(2).required(),
              org_category_id: Joi.string().uuid().required(),
              notes: Joi.string().optional().allow(null),

              // Attachments inside line items
              attachments: Joi.array()
                .items(
                  Joi.object({
                    file_url: Joi.string().uri().required(),
                    file_name: Joi.string().required(),
                  })
                )
                .optional(),
            })
          )
          .optional(),

        // Attachments at supplier level
        attachments: Joi.array()
          .items(
            Joi.object({
              file_url: Joi.string().uri().required(),
              file_name: Joi.string().required(),
            })
          )
          .optional(),
      })
    )
    .min(1)
    .required(),
});

export const getQuotationByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const updateNegotiationSchema = Joi.object({
  quotation_supplier_id: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Quotation supplier ID is required",
      "string.guid": "Quotation supplier ID must be a valid UUID",
    }),

  quotation_id: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Quotation ID is required",
      "string.guid": "Quotation ID must be a valid UUID",
    }),

  supplier_id: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Supplier ID is required",
      "string.guid": "Supplier ID must be a valid UUID",
    }),

  offered_price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "Offered price must be a number",
      "number.positive": "Offered price must be positive",
      "any.required": "Offered price is required",
    }),

  offered_delivery_date: Joi.date()
    .iso()
    .optional()
    .messages({
      "date.base": "Offered delivery date must be a valid date",
      "date.format": "Offered delivery date must be in ISO format",
    }),

  offered_delivery_days: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      "number.base": "Offered delivery days must be a number",
      "number.min": "Offered delivery days must be at least 1",
    }),

  offered_warranty: Joi.string()
    .max(255)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "Offered warranty must be a string",
      "string.max": "Offered warranty cannot exceed 255 characters",
    }),

  offered_notes: Joi.string()
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": "Offered notes must be a string",
      "string.max": "Offered notes cannot exceed 500 characters",
    }),

  initiated_by: Joi.string()
    .valid("admin", "supplier")
    .required()
    .messages({
      "any.only": "Initiated by must be either 'admin' or 'supplier'",
      "any.required": "Initiated by is required",
    }),

  status: Joi.string()
    .valid("pending", "accepted", "rejected")
    .default("pending")
    .messages({
      "any.only": "Status must be either 'pending', 'accepted', or 'rejected'",
    }),
});

export const lineItemSchema = Joi.array().items(
  Joi.object({
    quotation_item_id: Joi.string().uuid().required(),
    item_name: Joi.string().required(),
    org_currency_id: Joi.string().uuid().required(),
    unit_price: Joi.number().precision(2).required(),
    quantity: Joi.number().integer().positive().required(),
    discount_percentage: Joi.number().precision(2).required(),
    delivery_fees: Joi.number().precision(2).required(),
    tax_percentage: Joi.number().precision(2).required(),
    total_amount: Joi.number().precision(2).required(),
    org_category_id: Joi.string().uuid().required(),
    notes: Joi.string().optional(),
    attachments: Joi.array()
      .items(
        Joi.object({
          file_url: Joi.string().uri().required(),
          file_name: Joi.string().required(),
        })
      )
      .optional(),
  })
);
