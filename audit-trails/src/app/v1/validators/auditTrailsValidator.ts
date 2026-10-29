const Joi = require("joi");

export const createAuditLogValidation = Joi.object({
  change: Joi.string().required(),
  feature: Joi.string().required(),
  action_performed: Joi.string().required(),
  change_log: Joi.any().optional(),
}).required();
