import Joi from "joi";

export const addEmployeeValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).required();