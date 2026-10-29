import Joi from "joi";

export const createScoringSchema = Joi.object({
  organization_id: Joi.string().uuid().required(),
  template_name: Joi.string().required(),
  org_category_id: Joi.string().uuid().optional().allow(null),
  scoring_method: Joi.string().valid("Hybrid", "Manual", "Auto").required(),
  visibility: Joi.string().valid("Private", "Public").default("Public"),
  restrict: Joi.boolean().default(false),
  configurations: Joi.array()
    .items(
      Joi.object({
        criteria: Joi.string().required(),
        weight: Joi.number().positive().required(),
      })
    )
    .min(1)
    .required(),
});

export const updateScoringSchema = Joi.object({
  organization_id: Joi.string().uuid().optional(),
  template_name: Joi.string().optional(),
  org_category_id: Joi.string().uuid().optional().allow(null),
  scoring_method: Joi.string().valid("Hybrid", "Manual", "Auto").optional(),
  visibility: Joi.string().valid("Private", "Public").optional(),
  restrict: Joi.boolean().optional(),
  configurations: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().optional(), // existing config update
      criteria: Joi.string().required(),
      weight: Joi.number().positive().required(),
    })
  ),
});
