const Joi = require("joi");
import {
  reportFrequenciesList,
  reportStatusesList,
  reportTypesList,
  weekDaysList,
} from "../../utils/constants";

export const createReportValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  subsidiary_id: Joi.string().required(),
  is_scheduled: Joi.boolean().required(),
  report_frequency: Joi.string()
    .valid(...reportFrequenciesList)
    .required(),
  frequency_day: Joi.string()
    .valid(...weekDaysList)
    .optional(),
  frequency_time: Joi.string().required(),
  date_format: Joi.string().required(),
  date_decimal_symbol: Joi.string().required(),
  report_type: Joi.string()
    .valid(...reportTypesList)
    .required(),
  report_columns: Joi.array().items(Joi.string()).required(),
  filter_start_date: Joi.date().required(),
  filter_end_date: Joi.date().required(),
  min_price: Joi.number().required(),
  max_price: Joi.number().required(),
  report_status: Joi.string()
    .valid(...reportStatusesList)
    .required(),
}).required();
