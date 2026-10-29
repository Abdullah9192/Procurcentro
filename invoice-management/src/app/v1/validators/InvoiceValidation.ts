import Joi from "joi";

export const getInvoicesValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string(),
  subsidiary_branch_id: Joi.string(),
  branch_department_id: Joi.string(),
  status: Joi.string()
    .valid("pending", "approved", "rejected", "draft")
    .optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();