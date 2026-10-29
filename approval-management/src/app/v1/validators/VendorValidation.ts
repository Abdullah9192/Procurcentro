import Joi from "joi";

export const updateVendorStatusValidation = Joi.object({
    supplier_status: Joi.string()
        .valid("approved", "rejected")
        .required(),
    supplier_status_reason: Joi.string().optional(),
    is_supplier_capable: Joi.boolean().default(false),
}).required();

export const verifyVendorDocumentValidation = Joi.array()
    .items(
        Joi.object({
            document_id: Joi.string().required(),
            is_verified: Joi.boolean().default(false),
        }).required()
    )
    .required();
