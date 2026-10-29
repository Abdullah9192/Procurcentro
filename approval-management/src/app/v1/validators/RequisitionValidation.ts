import Joi from "joi";

export const updateRequisitionStatusValidation = Joi.object({
  status: Joi.string()
    .valid("in_revision", "approved", "completed", "rejected")
    .required(),
    status_reason: Joi.string().optional(),
}).required();
