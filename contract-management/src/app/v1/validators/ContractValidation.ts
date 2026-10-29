import Joi from "joi";

export const createContractSchema = Joi.object({
  status: Joi.string()
    .valid("draft", "approved", "pending_approval", "rejected", "revision")
    .required(),
  contract_status: Joi.string()
    .valid("draft", "signed_and_active", "signed_and_non_active")
    .optional(),
  contract_type: Joi.string().required(),
  document: Joi.string().allow(null, "").optional(),
  signed_document: Joi.string().allow(null, "").optional(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  author_id: Joi.string().uuid().required(),
  author_name: Joi.string().required(),
  author_department_id: Joi.string().uuid().required(),
  author_department: Joi.string().required(),
  counter_party: Joi.string().required(),
  counter_party_id: Joi.string().uuid().required(),
  counter_party_primary_contact: Joi.string().required(),
  contract_term: Joi.string().valid("definite", "indefinite").required(),
  contract_effect_type: Joi.string().required(),
  effective_date: Joi.date().optional().allow(null),
  end_date: Joi.date().required(),
  termination_notice_period: Joi.number().integer().optional().allow(null),
  is_contract_renewable: Joi.boolean().optional().allow(null),
  expiration_reminder: Joi.number().integer().optional().allow(null),
  initiated_by: Joi.string().valid("organization", "external_party").optional(),
  organization_id: Joi.string().uuid().required(),
  renewal_type: Joi.string().optional().allow(null),
  renewal_term: Joi.number().integer().optional().allow(null),
  non_renew_notice_period: Joi.number().integer().optional().allow(null),
});

export const getAllContractsSchema = Joi.object({
  organization_id: Joi.string().uuid().optional(),
  contract_type: Joi.string().optional(),
  status: Joi.string()
    .valid("draft", "approved", "pending_approval", "rejected", "revision")
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow(""),
});

export const updateContractSchema = Joi.object({
  status: Joi.string()
    .valid("draft", "approved", "pending_approval", "rejected", "revision")
    .required(),
  contract_status: Joi.string()
    .valid("draft", "signed_and_active", "signed_and_non_active")
    .optional(),
  contract_type: Joi.string().optional(),
  document: Joi.string().allow(null, "").optional(),
  signed_document: Joi.string().allow(null, "").optional(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  author_id: Joi.string().uuid().optional(),
  author_name: Joi.string().optional(),
  author_department_id: Joi.string().uuid().optional(),
  author_department: Joi.string().optional(),
  counter_party: Joi.string().optional(),
  counter_party_id: Joi.string().uuid().optional(),
  counter_party_primary_contact: Joi.string().optional(),
  contract_term: Joi.string().valid("definite", "indefinite").optional(),
  contract_effect_type: Joi.string().optional(),
  effective_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  termination_notice_period: Joi.string().optional(),
  is_contract_renewable: Joi.boolean().optional(),
  expiration_reminder: Joi.string().optional(),
  initiated_by: Joi.string().valid("organization", "external_party").optional(),
  organization_id: Joi.string().uuid().optional(),
  renewal_type: Joi.string().optional().allow(null),
  renewal_term: Joi.number().integer().optional().allow(null),
  non_renew_notice_period: Joi.number().integer().optional().allow(null),
});

export const addContractSignersSchema = Joi.object({
  signers: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        signer_order: Joi.number().integer().optional().allow(null),
        signer_type: Joi.string()
          .valid("organization", "counter_party")
          .required(),
      }),
    )
    .min(1)
    .required(),
});

export const addContractSignerFieldsSchema = Joi.object({
  signers: Joi.array()
    .items(
      Joi.object({
        signer_id: Joi.string().uuid().required(),

        fields: Joi.array()
          .items(
            Joi.object({
              field_type: Joi.string()
                .valid(
                  "signature",
                  "initials",
                  "date",
                  "name",
                  "company_stamp",
                  "text",
                )
                .required(),

              page_no: Joi.number().integer().min(1).required(),
              x_position: Joi.number().required(),
              y_position: Joi.number().required(),
              width: Joi.number().positive().required(),
              height: Joi.number().positive().required(),
              is_required: Joi.boolean().optional(),
            }),
          )
          .min(1)
          .required(),
      }),
    )
    .min(1)
    .required(),
});

export const createOrderContractSchema = Joi.object({
  purchase_order_id: Joi.string().uuid().required(),

  document: Joi.string().required(),

  signers: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),

        type: Joi.string()
          .valid("organization", "supplier")
          .required(),

        signer_order: Joi.number().required(),

        fields: Joi.array()
          .items(
            Joi.object({
              field_type: Joi.string().valid(
                  "signature",
                  "initials",
                  "date",
                  "name",
                  "company_stamp",
                  "text",
                ).required(),

              page_no: Joi.number().required(),

              x_position: Joi.number().required(),
              y_position: Joi.number().required(),

              width: Joi.number().required(),
              height: Joi.number().required(),

              is_required: Joi.boolean().optional(),
            })
          )
          .min(1)
          .required(),
      })
    )
    .min(1)
    .required(),
});