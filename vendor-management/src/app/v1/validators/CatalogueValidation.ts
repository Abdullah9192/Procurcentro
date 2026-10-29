import Joi from "joi";

export const supplierCatalogueLocationValidation = Joi.object({
  subsidiary_branch_id: Joi.string().uuid().required(),
  current_stock_quantity: Joi.number().required(),
});

export const supplierCatalogueValidation = Joi.object({
  item_name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Item name is required",
    "string.max": "Item name cannot exceed 255 characters",
  }),

  item_description: Joi.string().allow(null, "").optional(),

  supplier_category_id: Joi.string().uuid().required().messages({
    "string.empty": "Organization category ID is required",
    "string.guid": "Organization category ID must be a valid UUID",
  }),

  brand_name: Joi.string().allow(null, "").optional(),

  sku: Joi.string().allow(null, "").optional(),

  stock_price: Joi.number().min(0).precision(2).allow(null).optional().messages({
    "number.min": "Stock price must be greater than or equal to 0",
    "number.base": "Stock price must be a valid number",
  }),

  estimated_shipping_price: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .optional()
    .messages({
      "number.min": "Estimated shipping price must be greater than or equal to 0",
      "number.base": "Estimated shipping price must be a valid number",
    }),

  estimated_tax: Joi.number().min(0).precision(2).allow(null).optional().messages({
    "number.min": "Estimated tax must be greater than or equal to 0",
    "number.base": "Estimated tax must be a valid number",
  }),

  estimated_total_price: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .optional()
    .messages({
      "number.min": "Estimated total price must be greater than or equal to 0",
      "number.base": "Estimated total price must be a valid number",
    }),

  dimensions: Joi.string().allow(null, "").optional(),

  weight: Joi.string().allow(null, "").optional(),

  type: Joi.string().valid("item", "service").required().messages({
    "any.only": 'Type must be either "item" or "service"',
  }),

  is_active: Joi.boolean().default(true).optional(),

  unit: Joi.string()
    .valid(
      "piece",
      "box",
      "pack",
      "daily",
      "hourly",
      "monthly",
      "litre",
      "meter"
    )
    .allow(null)
    .optional(),

  locations: Joi.array()
    .items(supplierCatalogueLocationValidation)
    .optional(),
    
  images: Joi.array()
    .items(
      Joi.object({
        file_url: Joi.string().uri().required().messages({
          "string.uri": "File URL must be a valid URL",
          "string.empty": "File URL is required",
        }),
      })
    )
    .optional(),
});

export const updateSupplierCatalogueLocationsValidation = Joi.object({
  locations: Joi.array()
    .items(
      Joi.object({
        subsidiary_branch_id: Joi.string().uuid().required(),
        current_stock_quantity: Joi.number().required(),
      })
    )
    .required(),
});

export const supplierCatalogueUpdateValidation = Joi.object({
  supplier_catalogue_id: Joi.string().uuid().required().messages({
    "string.empty": "Supplier catalogue ID is required",
    "string.guid": "Supplier catalogue ID must be a valid UUID",
  }),

  organization_id: Joi.string().uuid().required().messages({
    "string.empty": "Organization ID is required",
    "string.guid": "Organization ID must be a valid UUID",
  }),

  item_name: Joi.string().min(1).max(255).optional().messages({
    "string.empty": "Item name cannot be empty",
    "string.max": "Item name cannot exceed 255 characters",
  }),

  item_description: Joi.string().allow(null, "").optional(),

  supplier_category_id: Joi.string().uuid().optional().messages({
    "string.guid": "Organization category ID must be a valid UUID",
  }),

  brand_name: Joi.string().allow(null, "").optional(),

  sku: Joi.string().allow(null, "").optional(),

  stock_price: Joi.number().min(0).precision(2).allow(null).optional().messages({
    "number.min": "Stock price must be greater than or equal to 0",
    "number.base": "Stock price must be a valid number",
  }),

  estimated_shipping_price: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .optional()
    .messages({
      "number.min": "Estimated shipping price must be greater than or equal to 0",
      "number.base": "Estimated shipping price must be a valid number",
    }),

  estimated_tax: Joi.number().min(0).precision(2).allow(null).optional().messages({
    "number.min": "Estimated tax must be greater than or equal to 0",
    "number.base": "Estimated tax must be a valid number",
  }),

  estimated_total_price: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .optional()
    .messages({
      "number.min": "Estimated total price must be greater than or equal to 0",
      "number.base": "Estimated total price must be a valid number",
    }),

  dimensions: Joi.string().allow(null, "").optional(),

  weight: Joi.string().allow(null, "").optional(),

  type: Joi.string().valid("item", "service").optional().messages({
    "any.only": 'Type must be either "item" or "service"',
  }),

  is_active: Joi.boolean().optional(),

  unit: Joi.string()
    .valid(
      "piece",
      "box",
      "pack",
      "daily",
      "hourly",
      "monthly",
      "litre",
      "meter"
    )
    .allow(null)
    .optional(),

  images: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional().messages({
          "string.guid": "Image ID must be a valid UUID",
        }),
        file_url: Joi.string().uri().required().messages({
          "string.uri": "File URL must be a valid URL",
          "string.empty": "File URL is required",
        }),
      })
    )
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });


export const getCatalogueByIdValidation = Joi.object({
  organization_id: Joi.string().required(),
  supplier_catalogue_id: Joi.string().required(),
});

export const getCatalogueListValidation = Joi.object({
  organization_id: Joi.string().required(),
  limit: Joi.number(),
  page: Joi.number(),
  search: Joi.string(),
  type: Joi.string().valid("item", "service"),
  is_active: Joi.boolean(),
  item_name: Joi.string(),
  supplier_category_id: Joi.string(),
  min_price: Joi.number(),
  max_price: Joi.number(),
  restock_from_date: Joi.date(),
  restock_to_date: Joi.date(),
});

export const createSupplierSubRatingSchema = Joi.object({
  supplier_user_id: Joi.string().uuid().required(),
  rating_user_id: Joi.string().uuid().required(),
  quality_item_rating: Joi.number().integer().min(1).max(10).required(),
  fullfill_order_rating: Joi.number().integer().min(1).max(10).required(),
  resolving_complaint_rating: Joi.number().integer().min(1).max(10).required(),
  shipment_terms_rating: Joi.number().integer().min(1).max(10).required(),
  communication_rating: Joi.number().integer().min(1).max(10).required(),
  experience_working_rating: Joi.number().integer().min(1).max(10).required(),
  comment: Joi.string().allow(null, "").optional(),
});
