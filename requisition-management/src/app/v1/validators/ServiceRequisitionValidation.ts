import Joi from "joi";

export const addExternalServiceRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  expected_start_date: Joi.date().required(),
  expected_end_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("external").required(),
  request_type: Joi.string().valid("service").required(),
  external_services: Joi.array()
    .items(
      Joi.object({
        service_name: Joi.string().required(),
        org_category_id: Joi.string().guid({ version: "uuidv4" }).required(),
        budget_id: Joi.string().guid({ version: "uuidv4" }).required(),
        budget_item_id: Joi.string().guid({ version: "uuidv4" }).required(),
        quantity: Joi.number().required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        unit_price: Joi.number().required(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        org_currency_id: Joi.string().guid({ version: "uuidv4" }).required(),
        frequency: Joi.string(),
        total_price: Joi.number().required(),
        comment: Joi.string().allow("", null),
        attachments: Joi.array()
          .items(
            Joi.object({
              file_name: Joi.string().required(),
              file_url: Joi.string().uri().required(),
            })
          )
          .required(),
      })
    )
    .required(),
});

export const updateExternalServiceRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  expected_start_date: Joi.date().required(),
  expected_end_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("external").required(),
  request_type: Joi.string().valid("service").required(),
  external_services: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid({ version: "uuidv4" }).allow(null),
        service_name: Joi.string().required(),
        org_category_id: Joi.string().guid({ version: "uuidv4" }).required(),
        budget_id: Joi.string().guid({ version: "uuidv4" }).required(),
        budget_item_id: Joi.string().guid({ version: "uuidv4" }).required(),
        quantity: Joi.number().required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        unit_price: Joi.number().required(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        org_currency_id: Joi.string().guid({ version: "uuidv4" }).required(),
        frequency: Joi.string(),
        total_price: Joi.number().required(),
        comment: Joi.string().allow("", null),
        attachments: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().guid({ version: "uuidv4" }).allow(null),
              file_name: Joi.string().required(),
              file_url: Joi.string().uri().required(),
            })
          ),
      })
    ),
});


export const addInternalServiceRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  expected_start_date: Joi.date().required(),
  expected_end_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("internal").required(),
  request_type: Joi.string().valid("service").required(),
  internal_services: Joi.array()
    .items(
      Joi.object({
        org_item_id: Joi.string().guid({ version: "uuidv4" }),
        quantity: Joi.number().required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        frequency: Joi.string(),
        comment: Joi.string().allow("", null),
        attachments: Joi.array()
          .items(
            Joi.object({
              file_name: Joi.string().required(),
              file_url: Joi.string().uri().required(),
            })
          )
          .required(),
      })
    )
    .required(),
});

export const updateInternalServiceRequisitionValidation = Joi.object({
  subsidiary_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  title: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").required(),
  subsidiary_branch_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  branch_department_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
  receiving_location: Joi.string().required(),
  expected_start_date: Joi.date().required(),
  expected_end_date: Joi.date().required(),
  approval_workflow_id: Joi.string().guid({ version: "uuidv4" }).required(),
  type: Joi.string().valid("internal").required(),
  request_type: Joi.string().valid("service").required(),
  internal_services: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid({ version: "uuidv4" }).allow(null),
        org_item_id: Joi.string().guid({ version: "uuidv4" }),
        quantity: Joi.number().required(),
        use_type: Joi.string().valid("one_time", "recurring").required(),
        start_date: Joi.date(),
        end_date: Joi.date(),
        frequency: Joi.string(),
        comment: Joi.string().allow("", null),
        attachments: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().guid({ version: "uuidv4" }).allow(null),
              file_name: Joi.string().required(),
              file_url: Joi.string().uri().required(),
            })
          ),
      })
    )
});