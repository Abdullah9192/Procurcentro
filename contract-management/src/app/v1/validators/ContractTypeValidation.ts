import Joi from "joi";

export const contractTypeSchema = Joi.object({
  organization_id: Joi.string().uuid().required(),
  contract_type: Joi.string().required(),
  docs_url: Joi.string().uri().allow(null, ""),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  approval_work_flow_id: Joi.string().uuid().allow(null, ""),
  org_category_id: Joi.string().uuid().allow(null, ""),
  date_modification: Joi.date().allow(null),
  created_by: Joi.string().uuid().allow(null, ""),
});