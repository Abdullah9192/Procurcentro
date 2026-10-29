import Joi from "joi";

export const registerValidation = Joi.object({
  name: Joi.string().required(),
  organization_name: Joi.string().required(),
  country: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).required();

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const requestPasswordResetValidation = Joi.object({
  email: Joi.string().email().required(),
}).required();

export const resetPasswordValidation = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
}).required();

export const verifyEmailValidation = Joi.object({
  email: Joi.string().email().required(),
}).required();

export const userIdValidation = Joi.object({
  user_id: Joi.string().required(),
}).required();

export const adminUserValidation = Joi.object({
  user_id: Joi.string().required(),
  organization_id: Joi.string().required(),
}).required();

export const getAllOrgUsersValidation = Joi.object({
  organization_id: Joi.string().required(),
}).required();

export const getAllUsersValidation = Joi.object({
  branch_department_id: Joi.string().required(),
  subsidiary_id: Joi.string().required(),
  subsidiary_branch_id: Joi.string().required(),
}).required();

export const transferOwnerShipValidation = Joi.object({
  owner_id: Joi.string().required(),
  user_id: Joi.string().required(),
  organization_id: Joi.string().required(),
}).required();


export const orgRoleValidation = Joi.object({
  role_name: Joi.string().required(),
  description: Joi.string().optional(),
  organization_id: Joi.string().required(),
  module_ids: Joi.array().items(Joi.string()).default([])
}).required();

export const orgRolesValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
}).options({
  allowUnknown: false,
}).required();


export const addUserValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  subsidiary_id: Joi.string(),
  branch_department_id: Joi.string().required(),
  subsidiary_branch_id: Joi.string().required(),
  org_role_id: Joi.string().required(),
  is_head_department: Joi.boolean().required()
}).required();

export const addAdminValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
}).required();

export const purchaseOrderContractEmailValidation = Joi.object({
  emails: Joi.array()
    .items(Joi.string().email().required())
    .min(1)
    .required(),
  receiver_name: Joi.string().optional(),
  sender_name: Joi.string().optional(),
  purchase_order_name: Joi.string().optional(),
  organization_name: Joi.string().optional(),
  vendor_name: Joi.string().optional(),
  notes: Joi.string().optional(),
});