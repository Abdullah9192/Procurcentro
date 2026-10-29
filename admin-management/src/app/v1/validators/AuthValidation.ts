import Joi from "joi";

const personalEmailDomains = [
  // "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
  "yopmail.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com"
];
export const setPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerValidation = Joi.object({
  name: Joi.string().required(),
  organization_name: Joi.string().required(),
  country: Joi.string().required(),
  email: Joi.string()
    .email()
    .required()
    .custom((value, helpers) => {
      const domain = value.split("@")[1]?.toLowerCase();
      if (personalEmailDomains.includes(domain)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid":
        "Personal email addresses are not allowed. Please use your business email.",
    }),
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

export const updateInfoValidation = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  branch_department_id: Joi.string(),
  subsidiary_branch_id: Joi.string(),
  email: Joi.string().email().required(),
}).required();

export const changePasswordValidation = Joi.object({
  current_password: Joi.string().min(6).required(),
  new_password: Joi.string().min(6).required(),
  confirm_new_password: Joi.string()
    .valid(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
    }),
}).required();
