import { Op, Transaction, WhereOptions } from "sequelize";
import { BaseService } from "../../services/BaseService";
import OrgCategory from "../../models/OrgCategory";
import OrgSubCategory from "../../models/OrgSubCategory";
import OrgCategoryService from "../../models/OrgCategoryService";
import OrgCurrency from "../../models/OrgCurrency";

// Initialize services
const categoryService = new BaseService(OrgCategory);
const categoryServiceService = new BaseService(OrgCategoryService);
const currencyService = new BaseService(OrgCurrency);

// ======================= Categories =======================
export const executeAddCategory = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const enrichedPayload = data.map((item: any) => ({
    ...item,
    organization_id,
  }));

  const category_name = enrichedPayload.map((item: any) => item.category_name);

  const existingCategory = await categoryService.findAll({
    where: {
      category_name: category_name,
      organization_id,
    },
  });

  if (existingCategory.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: `Category(ies) with same name already exist}`,
    };
  }

  const savedRecords = await categoryService.bulkCreate(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Category Created Successfully!",
    data: savedRecords,
  };
};

export const executeGetCategories = async (requestData: any) => {
  let result;

  const { page, limit, organization_id } = requestData;
  if (page && limit) {
    result = await categoryService.paginate({
      page,
      limit,
      options: {
        where: { organization_id },
      },
    });
  } else {
    const categoryList = await categoryService.findAll({
      where: { organization_id },
    });
    result = {
      data: categoryList,
      total: categoryList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Category list fetched successfully",
    data: result,
  };
};

export const executeGetCategory = async (id: any) => {
  const category = await categoryService.findOne({
    where: { id },
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Category data retrieved successfully",
    data: category,
  };
};

export const executeUpdateCategory = async (
  id: any,
  data: any,
  user: any,
  transaction: Transaction
) => {
  const category = await OrgCategory.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
    };
  }
  await OrgCategory.update(data, { where: { id: category.id }, transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Category updated successfully",
    data: category,
  };
};

export const executeDeleteCategory = async (
  id: any,
  user: any,
  transaction: Transaction
) => {
  const category = await OrgCategory.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
    };
  }
  await category.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Category deleted successfully",
  };
};

// ====== Deactivate / Activate Category
export const executeDeactivateCategory = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const categoryData = await OrgCategory.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!categoryData) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found.",
    };
  }
  const newStatus = !categoryData.is_active;
  await categoryData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Category ${
      newStatus ? "activated" : "deactivated"
    } successfully.`,
  };
};

// ======= get categories by ids
export const executeGetCategoriesByIds = async (
  ids: string[],
  organization_id: string
) => {
  const search: WhereOptions = {};
  if (ids.length > 0) {
    search["id"] = {
      [Op.in]: ids,
    };
  }
  if (organization_id) {
    search["organization_id"] = organization_id;
  }
  const categories = await OrgCategory.findAll({
    where: search,
  });
  return {
    success: true,
    statusCode: 200,
    message: "Category list fetched successfully",
    data: categories,
  };
};

// ====================== Sub Categories =======================

export const executeAddSubCategory = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const enrichedPayload = data.map((item: any) => ({
    name: item?.name,
    org_category_id: item?.org_category_id,
    organization_id,
  }));

  const sub_category_name = enrichedPayload.map((item: any) => item.name);
  const categoryIds = enrichedPayload.map((item: any) => item.org_category_id);

  const existingSubCategory = await OrgSubCategory.findAll({
    where: {
      name: {
        [Op.in]: sub_category_name,
      },
      organization_id,
      org_category_id: {
        [Op.in]: categoryIds,
      },
    },
  });

  if (existingSubCategory.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: `Sub Categories with same name already exist`,
    };
  }
  const savedRecords = await OrgSubCategory.bulkCreate(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 201,
    message: "Org Sub Categories Created Successfully!",
    data: savedRecords,
  };
};
export const executeGetSubCategories = async (requestData: any) => {
  const { page, limit, organization_id, org_category_id } = requestData;

  const whereCondition: Record<string, any> = {
    organization_id,
  };

  if (org_category_id) {
    whereCondition.org_category_id = org_category_id;
  }
  const includeCategory = {
    model: OrgCategory,
    as: "category",
  };

  // If no pagination → return full list
  if (!page && !limit) {
    const categoryList = await OrgSubCategory.findAll({
      where: whereCondition,
      include: [includeCategory],
      order: [["created_at", "DESC"]],
      raw: true,
    });

    return {
      success: true,
      statusCode: 200,
      message: "Sub Category list fetched successfully",
      data: categoryList,
    };
  }

  // With pagination
  const currentPage = parseInt(page) || 1;
  const currentLimit = parseInt(limit) || 10;
  const offset = (currentPage - 1) * currentLimit;

  const { count: totalCount, rows: categoryList } =
    await OrgSubCategory.findAndCountAll({
      where: whereCondition,
      limit: currentLimit,
      offset,
      include: [includeCategory],
      order: [["created_at", "DESC"]],
      raw: true,
    });

  const totalPages = Math.ceil(totalCount / currentLimit);

  return {
    success: true,
    statusCode: 200,
    message: "Sub Category list fetched successfully",
    data: {
      categories: categoryList,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    },
  };
};

export const executeGetSubCategory = async (requestData: any) => {
  const { id, organization_id } = requestData;
  const includeCategory = {
    model: OrgCategory,
    as: "category",
  };
  const category = await OrgSubCategory.findOne({
    where: { id, organization_id },
    include: [includeCategory],
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: " Sub Category not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Sub Category fetched successfully",
    data: category,
  };
};

// ====== Deactivate / Activate Category Item
export const executeDeactivateSubCategory = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const itemData = await OrgSubCategory.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!itemData) {
    return {
      success: false,
      statusCode: 404,
      message: "Sub Category not found.",
    };
  }
  const newStatus = !itemData.is_active;
  await itemData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Sub Category ${
      newStatus ? "activated" : "deactivated"
    } successfully.`,
  };
};

export const executeUpdateSubCategory = async (
  id: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const category = await OrgSubCategory.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Sub Category not found",
    };
  }
  await category.update(payload, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Sub Category updated successfully",
    data: category,
  };
};

export const executeDeleteSubCategory = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const category = await OrgSubCategory.findOne({
    where: { id: id, organization_id: user.organization_id },
    transaction,
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Sub Category not found",
    };
  }
  await category.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Sub Category deleted successfully",
  };
};

// ====================== Category Services =======================

export const executeAddCategoryService = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const enrichedPayload = data.map((item: any) => ({
    ...item,
    organization_id,
  }));

  const category_service_name = enrichedPayload.map((item: any) => item.name);
  const categoryIds = enrichedPayload.map((item: any) => item.org_category_id);

  const existingCategoryService = await categoryServiceService.findAll({
    where: {
      name: {
        [Op.in]: category_service_name,
      },
      organization_id,
      org_category_id: {
        [Op.in]: categoryIds,
      },
    },
  });

  if (existingCategoryService.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: `Category Service(s) with same name already exist`,
    };
  }

  const savedRecords = await categoryServiceService.bulkCreate(
    enrichedPayload,
    { transaction }
  );

  return {
    success: true,
    statusCode: 201,
    message: "Category Service(es) Created Successfully!",
    data: {
      data: savedRecords,
    },
  };
};

export const executeGetCategoryServices = async (requestData: any) => {
  let result;

  const { page, limit, organization_id, org_category_id } = requestData;

  const whereCondition: any = {
    organization_id: organization_id,
  };

  if (org_category_id) {
    whereCondition.org_category_id = org_category_id;
  }
  if (page && limit) {
    result = await categoryServiceService.paginate({
      page,
      limit,
      options: {
        where: whereCondition,
      },
    });
  } else {
    const categoryServiceList = await categoryServiceService.findAll({
      where: whereCondition,
    });
    result = {
      data: categoryServiceList,
      total: categoryServiceList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Category Service list fetched successfully",
    data: result,
  };
};

export const executeGetCategoryService = async (requestData: any) => {
  const { id, organization_id } = requestData;
  const category = await categoryServiceService.findOne({
    where: { id, organization_id },
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category Service not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Category Service fetched successfully",
    data: category,
  };
};

export const executeDeleteCategoryService = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const categoryServiceData = await OrgCategoryService.findOne({
    where: { id, organization_id: user?.organization_id },
    transaction,
  });
  if (!categoryServiceData) {
    return {
      success: false,
      statusCode: 404,
      message: "Category Service not found",
    };
  }
  await categoryServiceData.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Category Service deleted successfully",
  };
};

export const executeUpdateCategoryService = async (
  id: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const categoryServiceData = await categoryServiceService.findOne({
    where: { id, organization_id: user?.organization_id },
    transaction,
  });
  if (!categoryServiceData) {
    return {
      success: false,
      statusCode: 404,
      message: "Category Service not found",
    };
  }
  await categoryServiceData.update(payload, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Category Service updated successfully",
    data: categoryServiceData,
  };
};

// ====== Deactivate / Activate Category Service
export const executeDeactivateCaregoryService = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const serviceData = await categoryServiceService.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!serviceData) {
    return {
      success: false,
      statusCode: 404,
      message: "Category Service not found.",
    };
  }
  const newStatus = !serviceData.is_active;
  await categoryServiceService.update(
    { is_active: newStatus },
    {
      where: { id, organization_id: user.organization_id },
      transaction,
    }
  );
  return {
    success: true,
    statusCode: 200,
    message: `Category Service ${
      newStatus ? "activated" : "deactivated"
    } successfully.`,
  };
};

// ====================== Currencies =======================

export const executeAddCurrency = async (
  data: any,
  user: any,
  transaction: Transaction
) => {
  const organization_id = user?.organization_id;
  const enrichedPayload = data.map((item: any) => ({
    ...item,
    organization_id,
  }));

  const currency_name = enrichedPayload.map((item: any) => item.currency);

  const existingCurrencies = await currencyService.findAll({
    where: {
      currency: {
        [Op.in]: currency_name,
      },
      organization_id,
    },
  });

  if (existingCurrencies.length > 0) {
    return {
      success: false,
      statusCode: 400,
      message: `Currency(ies) with same name already exist`,
    };
  }

  const savedRecords = await currencyService.bulkCreate(enrichedPayload, {
    transaction,
  });

  return {
    success: true,
    statusCode: 201,
    message: "Currency(ies) Created Successfully!",
    data: {
      data: savedRecords,
    },
  };
};

export const executeGetCurrencies = async (requestData: any) => {
  let result;

  const { page, limit, organization_id } = requestData;
  if (page && limit) {
    result = await currencyService.paginate({
      page,
      limit,
      options: {
        where: { organization_id },
      },
    });
  } else {
    const currencyList = await currencyService.findAll({
      where: { organization_id },
    });
    result = {
      data: currencyList,
      total: currencyList.length,
      pages: 1,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Currency list fetched successfully",
    data: result,
  };
};

export const executeDeleteCurrency = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const currencyData = await currencyService.findOne({
    where: { id, organization_id: user?.organization_id },
    transaction,
  });
  if (!currencyData) {
    return {
      success: false,
      statusCode: 404,
      message: "Currency not found",
    };
  }
  await currencyData.destroy({ transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Currency deleted successfully",
  };
};

export const executeGetCurrency = async (requestData: any) => {
  const { id, organization_id } = requestData;
  const currencyData = await currencyService.findOne({
    where: { id, organization_id },
  });
  if (!currencyData) {
    return {
      success: false,
      statusCode: 404,
      message: "Currency not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Currency fetched successfully",
    data: currencyData,
  };
};

// ====== Deactivate / Activate Currency
export const executeDeactivateCurrency = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const currencyData = await currencyService.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!currencyData) {
    return {
      success: false,
      statusCode: 404,
      message: "Currency not found.",
    };
  }
  const newStatus = !currencyData.is_active;
  await currencyData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Currency ${
      newStatus ? "activated" : "deactivated"
    } successfully.`,
  };
};

export const executeUpdateCurrency = async (
  id: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const currencyData = await currencyService.findOne({
    where: { id, organization_id: user?.organization_id },
    transaction,
  });
  if (!currencyData) {
    return {
      success: false,
      statusCode: 404,
      message: "Currency not found",
    };
  }
  await currencyData.update(payload, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: "Currency updated successfully",
    data: currencyData,
  };
};
