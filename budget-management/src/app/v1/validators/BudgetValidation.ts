import Joi from "joi";

export const budgetItemValidation = Joi.object({
  item_name: Joi.string().required(),
  org_sub_category_id: Joi.string().guid().required(),
  amount: Joi.number().precision(2).required(),
  warning_limit: Joi.number().required(),
  allow_exceed_budget: Joi.boolean().default(false),
  limit_exceed_amount: Joi.number().precision(2).required(),
});

export const adminBudgetValidation = Joi.object({
  name: Joi.string().required(),
  org_category_id: Joi.string().guid().required(),
  org_currency_id: Joi.string().guid().required(),
  approval_workflow_id: Joi.string().guid().required(),
  budget_cycle: Joi.string().required(),
  duration: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  status: Joi.string()
    .valid(
      "draft",
      "in_revision",
      "pending_approval",
      "approved",
      "completed",
      "rejected"
    )
    .default("draft"),
  notes: Joi.string().allow("").optional(),
  subsidiary_id: Joi.string().guid().required(),
  subsidiary_branch_id: Joi.string().guid().required(),
  branch_department_id: Joi.string().guid().required(),
  organization_id: Joi.string().guid().required(),
  total_budget: Joi.number().precision(2).required(),

  // Accept either JSON string or array directly
  budget_items: Joi.alternatives()
    .try(
      Joi.array().items(budgetItemValidation).min(1),
      Joi.string() // to parse JSON string from multipart/form-data
    )
    .required(),

  attachment_files: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().uri()),
      Joi.string() // in case of comma-separated string or one stringified
    )
    .optional(),
});

export const budgetListValidation = Joi.object({
  limit: Joi.number().optional(),
  page: Joi.number().optional(),
  query: Joi.string().optional(),
  queryKey: Joi.string().optional(),
  search: Joi.string().optional(),
  subsidiary_id: Joi.string().optional(),
  subsidiary_branch_id: Joi.string().optional(),
  branch_department_id: Joi.string().optional(),
  status: Joi.alternatives().try(
    Joi.string().valid(
      "draft",
      "in_revision",
      "pending_approval",
      "approved",
      "completed",
      "rejected"
    ),
    Joi.array().items(
      Joi.string().valid(
        "draft",
        "in_revision",
        "pending_approval",
        "approved",
        "completed",
        "rejected"
      )
    )
  ).optional(),
  organization_id: Joi.string().optional(),
  category_id: Joi.string().optional(),
  cycle: Joi.string().optional(),
  initiator: Joi.string().optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const statusBudgetValidation = Joi.object({
  organization_id: Joi.string().guid().required(),
  budget_id: Joi.string().guid().required(),
  status: Joi.string()
    .valid(
      "draft",
      "in_revision",
      "pending_approval",
      "approved",
      "completed",
      "rejected"
    )
    .required(),
  updated_by: Joi.string().guid().optional(),
});
