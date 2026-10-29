import { Request, Response } from "express";
import {
  categoryServiceValidation,
  categoryValidation,
  currencyValidation,
  getCategoriesByIdValidation,
  getCategoriesValidation,
  getCurrencyValidation,
  getSubCategoryValidation,
  subCategoryValidation,
  updateCategoryServiceValidation,
  updateCategoryValidation,
  updateCurrencyValidation,
  updateSubCategoryValidation,
} from "../../validators/SetupValidation";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import {
  executeAddCategory,
  executeAddCategoryService,
  executeAddCurrency,
  executeAddSubCategory,
  executeDeactivateCaregoryService,
  executeDeactivateCategory,
  executeDeactivateCurrency,
  executeDeactivateSubCategory,
  executeDeleteCategory,
  executeDeleteCategoryService,
  executeDeleteCurrency,
  executeDeleteSubCategory,
  executeGetCategories,
  executeGetCategory,
  executeGetCategoryService,
  executeGetCategoryServices,
  executeGetCurrencies,
  executeGetCurrency,
  executeGetSubCategories,
  executeGetSubCategory,
  executeUpdateCategory,
  executeUpdateCategoryService,
  executeUpdateCurrency,
  executeUpdateSubCategory,
  executeGetCategoriesByIds,
} from "../../../respository/setup/SystemConfigurationRepository";
import { ExcelCategoryImporter } from "../../../services/imports/CategoryImportService";
import { ExcelSubCategoryImporter } from "../../../services/imports/SubCategoryImportService";
import { ExcelCategoryServiceImporter } from "../../../services/imports/CategoryServiceImportService";
import { ExcelCurrencyImporter } from "../../../services/imports/CurrencyImportService";

// ======================= Category =======================
// ======= Add Category:
export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const { error } = categoryValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddCategory(payload, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create Category.",
      error: err,
    });
  }
};

// ======= get Category list :
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: req.query.organization_id || user?.organization_id,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getCategoriesValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetCategories(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get category list.",
      error: err,
    });
  }
};

// ======= Get Category Detail :
export const getCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  try {
    const result = await executeGetCategory(id);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get category detail.",
      error: err,
    });
  }
};

// ==========Update Category :
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const payload = req.body;
  const { error } = updateCategoryValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateCategory(id, payload, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update branch.",
      error: err,
    });
  }
};

// =========== Delete Category :
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeleteCategory(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to delete category.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate category
export const deactivateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      statusCode: 401,
      message: "User authentication required",
      error: "unauthorized",
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeactivateCategory(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to deactivate category.",
      error: err,
    });
  }
};

// =========== categoryBulkUpload :
export const categoryBulkUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.organization_id) {
    errorResponse(res, {
      statusCode: 401,
      message: "User authentication required",
    });
    return;
  }

  if (!req.file) {
    errorResponse(res, {
      statusCode: 400,
      message: "No file provided.",
    });
    return;
  }

  try {
    await ExcelCategoryImporter.importCategories(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Categories uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload categories.",
      error: err,
    });
  }
};

// ================== get categories by ids
export const getCategoriesByIds = async (req: Request, res: Response) => {
  const { error } = await getCategoriesByIdValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const { ids, organization_id } = req.body;
  const result = await executeGetCategoriesByIds(ids, organization_id);
  if (!result.success) {
    errorResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
    return;
  }
  successResponse(res, {
    statusCode: result.statusCode,
    message: result.message,
    data: result.data,
  });
};

// ======================= Org Sub Category ===============

// ======= Add Category Item:
export const addSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const payload = Array.isArray(req.body.items)
    ? req.body.items
    : [req.body.items];

  const { error } = subCategoryValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddSubCategory(payload, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create Sub Category",
      error: err,
    });
  }
};

// ======= get Category list :
export const getSubCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: user?.organization_id,
    org_category_id: req.query.org_category_id
      ? req.query.org_category_id
      : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getSubCategoryValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetSubCategories(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get sub categories list.",
      error: err,
    });
  }
};

// =========== get Category Item :
export const getSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const requestData = {
    id: req.params.id,
    organization_id: user?.organization_id,
  };

  try {
    const result = await executeGetSubCategory(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get sub category.",
      error: err,
    });
  }
};

// =========== update Category Item :
export const updateSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const payload = req.body;
  const { error } = updateSubCategoryValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateSubCategory(
      id,
      payload,
      user,
      transaction
    );
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update sub category.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate category Item
export const deactivateSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      statusCode: 401,
      message: "User authentication required",
      error: "unauthorized",
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeactivateSubCategory(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to deactivate category Item.",
      error: err,
    });
  }
};

// ========= delete Category Item :
export const deleteSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeleteSubCategory(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to delete sub category.",
      error: err,
    });
  }
};

// ========= bulk upload Category Item :
export const subCategoryItemBulkUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  if (!req.file) {
    errorResponse(res, {
      statusCode: 400,
      message: "No file provided.",
    });
    return;
  }

  try {
    await ExcelSubCategoryImporter.importSubCategories(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Category Items uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload Category Items.",
      error: err,
    });
  }
};

// ======= Add Category Service:
export const addCategoryService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const payload = Array.isArray(req.body) ? req.body : [req.body];

  const { error } = categoryServiceValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddCategoryService(payload, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create Category Service.",
      error: err,
    });
  }
};

// ======= get Category Service list :
export const getCategoryServices = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: user?.organization_id,
    org_category_id: req.query.org_category_id
      ? req.query.org_category_id
      : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getSubCategoryValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetCategoryServices(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get category Service list.",
      error: err,
    });
  }
};

// =========== get Category Service :
export const getCategoryService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const requestData = {
    id: req?.params?.id,
    organization_id: user?.organization_id,
  };

  try {
    const result = await executeGetCategoryService(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get category Service.",
      error: err,
    });
  }
};

// ========= delete Category Service :
export const deleteCategoryService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeleteCategoryService(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to delete category Service.",
      error: err,
    });
  }
};

// =========== update Category Service :
export const updateCategoryService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const payload = req.body;
  const { error } = updateCategoryServiceValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateCategoryService(
      id,
      payload,
      user,
      transaction
    );
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update category Service.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate category Service
export const deactivateCategoryService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      statusCode: 401,
      message: "User authentication required",
      error: "unauthorized",
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeactivateCaregoryService(
      id,
      user,
      transaction
    );
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to deactivate category Service.",
      error: err,
    });
  }
};

// ========= bulk upload Category Service :
export const categoryServiceBulkUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  if (!req.file) {
    errorResponse(res, {
      statusCode: 400,
      message: "No file provided.",
    });
    return;
  }

  try {
    await ExcelCategoryServiceImporter.importCategoryServices(
      req.file.path,
      user
    );
    successResponse(res, {
      statusCode: 200,
      message: "Category Services uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload Category Services.",
      error: err,
    });
  }
};

// ======= Add Currency:
export const addCurrency = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const payload = Array.isArray(req.body) ? req.body : [req.body];

  const { error } = currencyValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddCurrency(payload, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create Currency.",
      error: err,
    });
  }
};

// ======= get Currency list :
export const getCurrencies = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: user?.organization_id,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getCurrencyValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  try {
    const result = await executeGetCurrencies(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get currency list.",
      error: err,
    });
  }
};

// ========= delete Currency :
export const deleteCurrency = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeleteCurrency(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to delete currency.",
      error: err,
    });
  }
};

// =========== get Currency :
export const getCurrency = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const requestData = {
    id: req?.params?.id,
    organization_id: user?.organization_id,
  };

  try {
    const result = await executeGetCurrency(requestData);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get currency.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate currency
export const deactivateCurrency = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      statusCode: 401,
      message: "User authentication required",
      error: "unauthorized",
    });
    return;
  }
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeactivateCurrency(id, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to deactivate currency.",
      error: err,
    });
  }
};

// =========== update Currency :
export const updateCurrency = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  const payload = req.body;
  const { error } = updateCurrencyValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateCurrency(id, payload, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update currency.",
      error: err,
    });
  }
};

// ========= bulk upload Currency :
export const currencyBulkUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  if (!req.file) {
    errorResponse(res, {
      statusCode: 400,
      message: "No file provided.",
    });
    return;
  }

  try {
    await ExcelCurrencyImporter.importCurrencies(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Currencies uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload Currecies.",
      error: err,
    });
  }
};
