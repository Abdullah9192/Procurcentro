import Joi from "joi";

export const updateQuotationStatusValidation = Joi.object({
    status: Joi.string()
        .valid("approved", "rejected")
        .required(),
    status_reason: Joi.string().optional(),
}).required();
