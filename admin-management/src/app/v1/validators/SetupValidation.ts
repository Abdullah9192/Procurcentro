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

export const orgProfileValidation = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().optional(),
  logo: Joi.string().optional(),
  company_url: Joi.string().optional(),
  primary_email: Joi.string().email().optional(),
  country: Joi.string().optional(),
  state: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
  zip_code: Joi.string().optional(),
  primary_contact_number: Joi.string().optional(),
  stepper: Joi.number().optional(),
  is_profile: Joi.boolean().optional(),
  is_setting: Joi.boolean().optional(),
  is_permission: Joi.boolean().optional(),
  is_approval: Joi.boolean().optional(),
  is_supplier: Joi.boolean().optional(),
  file: Joi.string().optional(),
  folderName: Joi.string().optional(),
}).required();

export const getOrganizationValidation = Joi.object({
  organization_id: Joi.string().required(),
}).required();

export const subsidiaryValidation = Joi.array()
  .items(
    Joi.object({
      subsidiary_name: Joi.string().required(),
      email: Joi.string().email().required(),
      address: Joi.string().required(),
      latitude: Joi.string().optional(),
      longitude: Joi.string().optional(),
    }).required()
  )
  .required();

export const updateSubsidiaryValidation = Joi.object({
  subsidiary_name: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
}).required();

export const getOrgSubsidiariesValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().guid().required(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const branchValidation = Joi.array()
  .items(
    Joi.object({
      branch_name: Joi.string().required(),
      address: Joi.string().required(),
      latitude: Joi.string().optional(),
      longitude: Joi.string().optional(),
      subsidiary_id: Joi.string().guid().required(),
    }).required()
  )
  .required();

export const updateBranchValidation = Joi.object({
  branch_name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.string().optional(),
  longitude: Joi.string().optional(),
  subsidiary_id: Joi.string().guid().required(),
}).required();

export const getBranchesValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const departmentValidation = Joi.array()
  .items(
    Joi.object({
      department_name: Joi.string().required(),
      subsidiary_id: Joi.string().guid().required(),
      subsidiary_branch_id: Joi.string().guid().required(),
    }).required()
  )
  .required();

export const updateDepartmentValidation = Joi.object({
  department_name: Joi.string().required(),
  subsidiary_id: Joi.string().guid().required(),
  subsidiary_branch_id: Joi.string().guid().required(),
}).required();

export const getDepartmentsValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string().optional(),
  subsidiary_branch_id: Joi.string().optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const categoryValidation = Joi.array()
  .items(
    Joi.object({
      category_name: Joi.string().required(),
    }).required()
  )
  .required();

export const updateCategoryValidation = Joi.object({
  category_name: Joi.string().required(),
});

export const getCategoriesByIdValidation = Joi.object({
  ids: Joi.array().items(Joi.string().guid()).min(1).required(),
  organization_id: Joi.string().required(),
});
export const getCategoriesValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const subCategoryValidation = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      org_category_id: Joi.string().guid().required(),
    }).required()
  )
  .required();

export const updateSubCategoryValidation = Joi.object({
  name: Joi.string().required(),
  org_category_id: Joi.string().guid().required(),
});

export const getSubCategoryValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  org_category_id: Joi.string(),
  organization_id: Joi.string().required(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const categoryServiceValidation = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      org_category_id: Joi.string().required(),
    }).required()
  )
  .required();

export const updateCategoryServiceValidation = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  org_category_id: Joi.string().guid(),
});

export const currencyValidation = Joi.array()
  .items(
    Joi.object({
      currency: Joi.string().required(),
      round_setting: Joi.string().valid("math", "up", "down").required(),
      is_main: Joi.boolean().default(false),
    }).required()
  )
  .required();

export const updateCurrencyValidation = Joi.object({
  currency: Joi.string().required(),
  round_setting: Joi.string().valid("math", "up", "down"),
  is_main: Joi.boolean().default(false),
});

export const getCurrencyValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const createApprovalWorkflowValidation = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow("", null),
  allow_approval_comments: Joi.boolean().default(true),
  allow_rejection_comments: Joi.boolean().default(true),
  reminder_enable: Joi.boolean().default(true),
  reminder_frequency: Joi.string().valid("12", "24", "48").required(),
  escalate_enable: Joi.boolean().default(true),
  escalate_to: Joi.string()
    .valid("admin", "next_level_approver", "all_stakeholders")
    .required(),
  skip_if_requester_is_approver: Joi.boolean().default(true),
  auto_approve_multiple_steps: Joi.boolean().default(true),
  subsidiary_id: Joi.string(),
  branch_department_id: Joi.string().required(),
  subsidiary_branch_id: Joi.string().required(),
}).required();

export const getWorkflowValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string().optional(),
  subsidiary_branch_id: Joi.string().optional(),
  subsidiary_department_id: Joi.string().optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const createWorkflowStepsValidation = Joi.object({
  workflow_id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "any.required": "workflow_id is required",
    "string.uuid": "workflow_id must be a valid UUID",
  }),
  approval_type: Joi.string().valid("linear", "parallel").required(),
  steps: Joi.array()
    .items(
      Joi.object({
        step_number: Joi.number().integer().min(1).required().messages({
          "any.required": "step_number is required",
          "number.base": "step_number must be a number",
          "number.min": "step_number must be at least 1",
        }),
        approver_user_ids: Joi.array()
          .items(
            Joi.string().uuid({ version: "uuidv4" }).required().messages({
              "string.uuid": "Each approver_user_id must be a valid UUID",
            })
          )
          .min(1)
          .required()
          .messages({
            "any.required": "approver_user_ids is required",
            "array.base": "approver_user_ids must be an array of UUIDs",
            "array.min": "At least one approver_user_id is required",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "steps is required",
      "array.base": "steps must be an array",
      "array.min": "At least one step must be provided",
    }),
}).required();

export const organizationSettingsBaseValidation = Joi.object({
  type: Joi.string()
    .valid(
      "purchase_requisition",
      "quotations",
      "purchase_orders",
      "invoice",
      "inventory",
      "contract"
    )
    .required(),
  subsidiary_id: Joi.string().uuid().allow(null),
  settings: Joi.object().required(),
});

const purchaseRequisitionSettingsValidation = Joi.object({
  customize_requisition_id: Joi.boolean().default(false),
  prefix: Joi.string().optional().allow(""),
  suffix: Joi.string().optional().allow(""),
});

const quotationsSettingsValidation = Joi.object({
  customize_quotation_id: Joi.boolean().default(false),
  prefix: Joi.string().optional().allow(""),
  suffix: Joi.string().optional().allow(""),
  deliver_to_receiving_location: Joi.boolean().default(false),
  restrict_closed_quotations: Joi.boolean().default(false),
  quotation_close_criteria: Joi.string().optional().allow(""),
});

const purchaseOrdersSettingsValidation = Joi.object({
  customize_purchaseOrder_id: Joi.boolean().default(false),
  suffix: Joi.string().optional().allow(""),
  prefix: Joi.string().optional().allow(""),
  payment_terms: Joi.boolean().default(false),
  tax_name: Joi.string().required(),
  tax_rate: Joi.string().required(),
});

const invoiceSettingsValidation = Joi.object({
  customize_invoice_number: Joi.boolean().default(false),
  purchase_order_id_format: Joi.string().optional().allow(""),
  add_tax: Joi.boolean().default(false),
  enable_three_way_matching: Joi.boolean().default(false),
  bill_control: Joi.string().optional().allow(""),
});

const inventoryContractSettingsValidation = Joi.object({
  annual_inventory_count: Joi.boolean().default(false),
  inventory_count_date: Joi.string().allow(""),
  shipping_email_confirmation: Joi.boolean().default(false),
  shipping_signature: Joi.boolean().default(false),
  stock_tracking: Joi.string().allow(""),
});

export const organizationSettingsValidation = Joi.object({
  type: Joi.string()
    .valid(
      "purchase_requisition",
      "quotations",
      "purchase_orders",
      "invoice",
      "inventory",
      "contract"
    )
    .required(),
  subsidiary_id: Joi.string().uuid().allow(null),
  settings: Joi.when("type", {
    switch: [
      {
        is: "purchase_requisition",
        then: purchaseRequisitionSettingsValidation,
      },
      {
        is: "quotations",
        then: quotationsSettingsValidation,
      },
      {
        is: "purchase_orders",
        then: purchaseOrdersSettingsValidation,
      },
      {
        is: "invoice",
        then: invoiceSettingsValidation,
      },
      {
        is: "inventory",
        then: inventoryContractSettingsValidation,
      },
      {
        is: "contract",
        then: inventoryContractSettingsValidation,
      },
    ],
    otherwise: Joi.object().required(),
  }),
}).required();

export const getModulesValidation = Joi.object({
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  organization_id: Joi.string().required(),
  subsidiary_id: Joi.string().optional(),
  type: Joi.string().optional(),
})
  .options({
    allowUnknown: false,
  })
  .required();

export const orgRoleValidation = Joi.object({
  role_name: Joi.string().required(),
  description: Joi.string().optional(),
  module_ids: Joi.array().items(Joi.string().guid()).default([]),
}).required();

export const updateOrgRoleValidation = Joi.object({
  role_name: Joi.string().optional(),
  description: Joi.string().optional(),
  module_ids: Joi.array().items(Joi.string().uuid()).optional(),
}).required();

export const addUserValidation = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      subsidiary_id: Joi.string().guid().required(),
      branch_department_id: Joi.string().guid().required(),
      subsidiary_branch_id: Joi.string().guid().required(),
      org_role_id: Joi.string().guid().required(),
      is_head_department: Joi.boolean().required(),
    })
  )
  .required();

export const updateUserValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  subsidiary_id: Joi.string().guid().required(),
  branch_department_id: Joi.string().guid().required(),
  subsidiary_branch_id: Joi.string().guid().required(),
  org_role_id: Joi.string().guid().required(),
  is_head_department: Joi.boolean().required(),
});


export const addAdminValidation = Joi.object({
  name: Joi.string().required(),
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
}).required();


export const singleInviteSupplierSchema = Joi.object({
  contact_name: Joi.string().min(3).max(500).required(),
  contact_email: Joi.string().email().required(),
  contact_phone: Joi.string().required(),
  contact_phone_code: Joi.string().optional(),
  certificate_of_incorporation: Joi.boolean().optional(),
  tax_clearance_certificate: Joi.boolean().optional(),
  vat_registration: Joi.boolean().optional(),
  audited_accounts: Joi.boolean().optional(),
  financial_capability: Joi.boolean().optional(),
  banking_details: Joi.boolean().optional(),
});

export const inviteSupplierValidation = Joi.array()
  .items(singleInviteSupplierSchema)
  .min(1);