import Joi from "joi";

export const internalRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().optional().allow(null),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  request_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("internal").required(),
  request_type: Joi.string().valid("service", "item").required(),
  internal_items: Joi.array()
    .items(
      Joi.object({
        org_item_id: Joi.string().guid({ version: "uuidv4" }).required(),
        quantity: Joi.number().min(1).required(),
        item_name: Joi.string().required(),
        item_image: Joi.string().uri().allow(null, ""),
        category_name: Joi.string().required(),
        unit: Joi.string().required(),
        stock_available: Joi.number().optional(),
        use_type: Joi.string().valid("deplete", "return").required(),
        receipt_date: Joi.date().required(),
        return_date: Joi.date().allow(null),
        comment: Joi.string().allow("", null),
        attachments: Joi.array()
          .items(
            Joi.object({
              file_name: Joi.string().required(),
              file_url: Joi.string().uri().required(),
            })
          )
          .required(),
      })
    )
    .required(),
});

export const updateInternalRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  request_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("internal").required(),
  request_type: Joi.string().valid("service", "item").required(),
  internal_items: Joi.array().items(
    Joi.object({
      id: Joi.string().guid({ version: "uuidv4" }),
      org_item_id: Joi.string().guid({ version: "uuidv4" }).required(),

      item_name: Joi.string().required(),
      item_image: Joi.string().uri().allow(null, ""),
      category_name: Joi.string().required(),
      unit: Joi.string().required(),
      stock_available: Joi.number().optional(),

      quantity: Joi.number().min(1).required(),
      use_type: Joi.string().valid("deplete", "return").required(),
      receipt_date: Joi.date().required(),
      return_date: Joi.date().allow(null),
      comment: Joi.string().allow("", null),
      attachments: Joi.array().items(
        Joi.object({
          id: Joi.string().guid({ version: "uuidv4" }),
          file_name: Joi.string().required(),
          file_url: Joi.string().uri().required(),
        })
      ),
    })
  ),
});

export const externalRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  request_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("external").required(),
  request_type: Joi.string().valid("service", "item").required(),
  total_request_amount: Joi.number().min(1).required(),
  external_items: Joi.array()
    .items(
      Joi.object({
        item_name: Joi.string().required(),
        item_image: Joi.string().uri().allow(null, ""),
        category_name: Joi.string().required(),
        unit: Joi.string().required(),
        stock_available: Joi.number().optional(),
        org_category_id: Joi.string().optional(),
        budget_id: Joi.string().optional(),
        budget_item_id: Joi.string().optional(),
        quantity: Joi.number().min(1).required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        unit_price: Joi.number().min(1).required(),
        org_currency_id: Joi.string().optional(),
        comment: Joi.string().allow("", null),
        frequency: Joi.string().allow("", null),
        start_date: Joi.date().allow(null),
        end_date: Joi.date().allow(null),
        total_price: Joi.number().min(1).required(),
        attachments: Joi.array()
          .items(
            Joi.object({
              file_name: Joi.string().required(),
              file_url: Joi.string().uri().required(),
            })
          )
          .optional(),
      })
    )
    .required(),
});

export const updateExternalRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  request_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("external").required(),
  request_type: Joi.string().valid("service", "item").required(),
  external_items: Joi.array().items(
    Joi.object({
      id: Joi.string().guid({ version: "uuidv4" }).allow(null),
      item_name: Joi.string().required(),
      item_image: Joi.string().uri().allow(null, ""),
      category_name: Joi.string().required(),
      unit: Joi.string().required(),
      stock_available: Joi.number().optional(),
      org_category_id: Joi.string().guid({ version: "uuidv4" }).required(),
      budget_id: Joi.string().guid({ version: "uuidv4" }).required(),
      budget_item_id: Joi.string().guid({ version: "uuidv4" }).required(),
      quantity: Joi.number().min(1).required(),
      use_type: Joi.string().valid("one_time", "recurring").required(),
      unit_price: Joi.number().min(1).required(),
      org_currency_id: Joi.string().guid({ version: "uuidv4" }).required(),
      comment: Joi.string().allow("", null),
      frequency: Joi.string().allow("", null),
      start_date: Joi.date().allow(null),
      end_date: Joi.date().allow(null),
      total_price: Joi.number().min(1).required(),
      attachments: Joi.array().items(
        Joi.object({
          id: Joi.string().guid({ version: "uuidv4" }).allow(null),
          file_name: Joi.string().required(),
          file_url: Joi.string().uri().required(),
        })
      ),
    })
  ),
});

export const updateRequisitionStatusValidation = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "draft"
    )
    .required(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).optional(),
}).required();

export const updateRequisitionValidation = Joi.object({
  title: Joi.string().optional(),
  priority: Joi.string().optional(),
  subsidiary_id: Joi.string().uuid().optional(),
  subsidiary_branch_id: Joi.string().uuid().optional(),
  branch_department_id: Joi.string().uuid().optional(),
  receiving_location: Joi.string().optional(),
  request_date: Joi.date().optional(),
  approval_workflow_id: Joi.string().uuid().optional(),
  type: Joi.string().valid("internal", "external").optional(),
  status: Joi.string()
    .valid(
      "pending",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "draft"
    )
    .optional(),
});

export const getRequisitionValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string(),
  subsidiary_branch_id: Joi.string(),
  branch_department_id: Joi.string(),
  status: Joi.string()
    .valid(
      "pending",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "draft"
    )
    .optional(),
  type: Joi.string().valid("internal", "external").optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const getRequisitionsValidation = Joi.object({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  search: Joi.string().optional(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string().optional(),
  subsidiary_branch_id: Joi.string().optional(),
  branch_department_id: Joi.string().optional(),
  requested_user: Joi.string().optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional(),
  status: Joi.alternatives().try(
    Joi.string().valid(
      "pending",
      "in_revision",
      "approved",
      "completed",
      "rejected",
      "draft"
    ),
    Joi.array().items(
      Joi.string().valid(
        "pending",
        "in_revision",
        "approved",
        "completed",
        "rejected",
        "draft"
      )
    )
  ).optional(),
  type: Joi.string().valid("internal", "external").optional(),
  use_type: Joi.string().valid("item", "service").optional(),
}).options({
  allowUnknown: false,
});
