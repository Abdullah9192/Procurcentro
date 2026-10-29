import Joi from "joi";

export const addVendorValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const updateSupplierBasicInfoValidation = Joi.object({
  company_logo: Joi.string().required(),
  business_name: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
  supplier_business_category_id: Joi.string().guid().required(),
  company_website: Joi.string()
    .pattern(
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/
    )
    .optional(),
  business_email: Joi.string().email(),
  date_of_incorporation: Joi.date().optional(),

  company_registration_no: Joi.string().required(),
  tax_identification_no: Joi.string().required(),
  vat_registration_no: Joi.string().required(),
  bank_verification_no: Joi.string().required(),

  company_registration_file: Joi.string().optional(),
  tax_identification_file: Joi.string().optional(),
  vat_registration_file: Joi.string().optional(),
  bank_verification_file: Joi.string().optional(),
}).required();

export const supplierKycValidation = Joi.object({
  nsitf_cert_number: Joi.string(),
  itf_cert_number: Joi.string(),
  pencom_cert_number: Joi.string(),
  interim_reg_report_number: Joi.string(),
  proof_of_address_number: Joi.string(),
  tax_cert_number: Joi.string(),
  moa_number: Joi.string().optional(),
  upstream_cert_number: Joi.string(),
  nsitf_cert_file: Joi.string(),
  itf_cert_file: Joi.string(),
  pencom_cert_file: Joi.string(),
  interim_reg_report_file: Joi.string(),
  proof_of_address_file: Joi.string(),
  tax_cert_file: Joi.string(),
  company_profile_file: Joi.string(),
  audited_accounts_file: Joi.string(),
  moa_file: Joi.string(),
  upstream_cert_file: Joi.string(),

}).required();

export const supplierBankInfoValidation = Joi.object({
  currency: Joi.string().optional(),
  account_type: Joi.string().valid("local", "foreign").required(),
  bank_account_name: Joi.string().optional(),
  bank_account_number: Joi.string().optional(),
  bank: Joi.string().optional(),
  iban: Joi.string().optional(),
  swift_code: Joi.string().optional(),
  sort_code: Joi.string().optional(),
  bank_branch_name: Joi.string().optional(),
  is_allowed: Joi.boolean().optional(),
}).required();

export const supplierBankInfoBulkValidation = Joi.array()
  .items(supplierBankInfoValidation)
  .min(1)
  .required();

export const supplierContactInfoValidation = Joi.object({
  contact_name: Joi.string().allow("", null),
  contact_email: Joi.string().email().allow("", null),
  contact_phone: Joi.string().allow("", null),
  contact_job_title: Joi.string().allow("", null),
  national_identity_number: Joi.string().required(),
  national_identity_file: Joi.string().required(),
  is_primary: Joi.boolean(),
}).required();

export const supplierContactInfoBulkValidation = Joi.array()
  .items(supplierContactInfoValidation)
  .min(1)
  .required();

export const supplierClientRefValidation = Joi.object({
  business_name: Joi.string(),
  location: Joi.string(),
  contract_start_date: Joi.date().iso(),
  contract_end_date: Joi.date().iso(),
  contact_name: Joi.string(),
  contact_email: Joi.string().email(),
  project_description: Joi.string(),
}).required();

export const supplierClientRefBulkValidation = Joi.array()
  .items(supplierClientRefValidation)
  .min(1)
  .required();

export const supplierDeclarationsValidation = Joi.object({
  client_performance_discussion: Joi.boolean(),
  pending_legal_actions: Joi.boolean(),
  professional_misconduct: Joi.boolean(),
  insolvency_or_bankruptcy: Joi.boolean(),
  tax_or_pension_arrears: Joi.boolean(),
  declaration_certified: Joi.boolean().valid(true),
}).required();

export const createSupplierSetupValidation = Joi.object({
  supplier_basic_info: updateSupplierBasicInfoValidation,
  supplier_bank_info: supplierBankInfoBulkValidation,
  supplier_kyc: supplierKycValidation,
  supplier_contact_info: supplierContactInfoBulkValidation,
  supplier_client_ref: supplierClientRefBulkValidation,
  supplier_declarations: supplierDeclarationsValidation,
}).required();

export const updateSupplierInfoValidation = Joi.object({
  supplier_id: Joi.string().guid().required(),
  user_id: Joi.string().guid().required(),
  organization_id: Joi.string().guid().required(),
  company_logo: Joi.string().optional(),
  business_name: Joi.string().optional(),
  country: Joi.string().optional(),
  state: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
  supplier_business_category_id: Joi.string().guid().optional(),
  company_website: Joi.string().uri().optional(),
  business_email: Joi.string().email().optional(),
  date_of_incorporation: Joi.date().optional(),

  company_registration_no: Joi.string().optional(),
  tax_identification_no: Joi.string().optional(),
  vat_registration_no: Joi.string().optional(),
  bank_verification_no: Joi.string().optional(),

  company_registration_file: Joi.string().optional(),
  tax_identification_file: Joi.string().optional(),
  vat_registration_file: Joi.string().optional(),
  bank_verification_file: Joi.string().optional(),


}).min(1);


export const updateSupplierBankInfoValidation = Joi.array().items(
  Joi.object({
    id: Joi.string().guid().optional().allow(''),
    org_currency_id: Joi.string().optional().allow(''),
    account_type: Joi.string().valid("local", "foreign").optional().allow(''),
    bank_account_name: Joi.string().optional().allow(''),
    bank_account_number: Joi.string().optional().allow(''),
    bank: Joi.string().optional().allow(''),
    iban: Joi.string().optional().allow(''),
    swift_code: Joi.string().optional().allow(''),
    sort_code: Joi.string().optional().allow(''),
    bank_branch_name: Joi.string().optional().allow(''),
    is_allowed: Joi.boolean().optional().allow(''),
  }).min(2)
);

export const updateSupplierKycInfoValidation = Joi.object({
  nsitf_cert_number: Joi.string().optional(),
  itf_cert_number: Joi.string().optional(),
  pencom_cert_number: Joi.string().optional(),
  interim_reg_report_number: Joi.string().optional(),
  proof_of_address_number: Joi.string().optional(),
  tax_cert_number: Joi.string().optional(),
  moa_number: Joi.string().optional(),
  upstream_cert_number: Joi.string().optional(),
  nsitf_cert_file: Joi.string().optional(),
  itf_cert_file: Joi.string().optional(),
  pencom_cert_file: Joi.string().optional(),
  interim_reg_report_file: Joi.string().optional(),
  proof_of_address_file: Joi.string().optional(),
  tax_cert_file: Joi.string().optional(),
  company_profile_file: Joi.string().optional(),
  audited_accounts_file: Joi.string().optional(),
  moa_file: Joi.string().optional(),
  upstream_cert_file: Joi.string().optional(),
}).min(2);

export const updateSupplierContactValidation = Joi.array().items(
  Joi.object({
    id: Joi.string().guid().optional(),
    contact_name: Joi.string().optional(),
    contact_email: Joi.string().email().optional(),
    contact_phone: Joi.string().optional(),
    contact_phone_code: Joi.string().optional(),
    contact_job_title: Joi.string().optional(),
    national_identity_number: Joi.string().optional(),
    is_primary: Joi.boolean().optional(),
    national_identity_file: Joi.string().optional(),
  }).min(1)
);

export const updateSupplierClientReferenceValidation = Joi.array().items(
  Joi.object({
    id: Joi.string().guid().optional(),
    business_name: Joi.string().optional(),
    location: Joi.string().optional(),
    latitude: Joi.string().optional(),
    longitude: Joi.string().optional(),
    contract_start_date: Joi.string().optional(),
    contract_end_date: Joi.string().optional(),
    contact_name: Joi.string().optional(),
    contact_email: Joi.string().email().optional(),
    project_description: Joi.string().optional(),
  }).min(1)
);
