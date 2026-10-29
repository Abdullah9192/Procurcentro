import Joi from "joi";


export const addOrgInventoryLocationValidation = Joi.object({
  subsidiary_branch_id: Joi.string(),
  current_stock_quantity: Joi.number(),
});

export const addOrgInventoryImageValidation = Joi.object({
  file_url: Joi.string(),
});

export const addOrgInventoryValidation = Joi.object({
  subsidiary_id: Joi.string().required(),
  item_name: Joi.string(),
  item_description: Joi.string(),
  org_category_id: Joi.string().required(),
  org_service_category_id: Joi.string().optional(),
  org_sub_category_id: Joi.string().optional(),
  brand_name: Joi.string().optional(),
  sku: Joi.string().optional(),
  estimated_stock_price: Joi.number().optional(),
  estimated_shipping_price: Joi.number().optional(),
  estimated_tax_price: Joi.number().optional(),
  estimated_total_price: Joi.number().optional(),
  stock_renewal_trigger: Joi.number().optional(),
  total_stock: Joi.number().optional(),
  low_inventory_notification: Joi.number().optional(),
  type: Joi.string().valid('item', 'service'),
  unit: Joi.string().valid('piece', 'box').allow(null),
  length: Joi.number().optional(),
  width: Joi.number().optional(),
  height: Joi.number().optional(),
  weight: Joi.number().optional(),
  is_active: Joi.boolean().truthy("true", "1").falsy("false", "0").optional(),
  locations: Joi.array().items(addOrgInventoryLocationValidation),
  images: Joi.array().items(addOrgInventoryImageValidation),
  weight_unit: Joi.string().valid('kg', 'g', 'lb', 'oz').optional(),
}).required();

export const addBulkOrgInventoryValidation = Joi.array()
  .items(addOrgInventoryValidation)
  .min(1)
  .required();

export const updateOrgInventoryLocationValidation = Joi.object({
  id: Joi.string(),
  subsidiary_branch_id: Joi.string(),
  current_stock_quantity: Joi.number(),
});

export const updateOrgInventoryImageValidation = Joi.object({
  id: Joi.string(),
  file_url: Joi.string(),
});
export const updateOrgInventoryValidation = Joi.object({
  subsidiary_id: Joi.string(),
  item_name: Joi.string(),
  item_description: Joi.string(),
  org_category_id: Joi.string(),
  org_sub_category_id: Joi.string().optional(),
  org_service_category_id: Joi.string().optional(),
  brand_name: Joi.string(),
  sku: Joi.string(),
  unit: Joi.string().valid('piece', 'box').allow(null),
  estimated_stock_price: Joi.number(),
  estimated_shipping_price: Joi.number(),
  estimated_tax_price: Joi.number(),
  estimated_total_price: Joi.number(),
  stock_renewal_trigger: Joi.number(),
  total_stock: Joi.number(),
  low_inventory_notification: Joi.number(),
  length: Joi.number(),
  width: Joi.number(),
  height: Joi.number(),
  weight: Joi.number(),
  locations: Joi.array().items(updateOrgInventoryLocationValidation),
  images: Joi.array().items(updateOrgInventoryImageValidation),
  is_active: Joi.boolean().optional(),
  weight_unit: Joi.string().valid('kg', 'g', 'lb', 'oz').optional(),
}).required();


export const moveOrgInventoryLocationValidation = Joi.object({
  subsidiary_branch_id: Joi.string(),
  current_stock_quantity: Joi.number(),
});

export const moveOrgInventoryLocationValidations = Joi.object({
  locations: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        location: Joi.string().optional(),
        current_stock_quantity: Joi.number().optional(),
      })
    )
    .min(2)
    .required(),
});

