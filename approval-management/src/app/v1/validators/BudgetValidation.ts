import Joi from "joi";

export const updateBudgetStatusValidation = Joi.object({
  status: Joi.string()
    .valid("in_revision", "approved", "completed", "rejected")
    .required(),
    status_reason: Joi.string().optional(),
}).required();

