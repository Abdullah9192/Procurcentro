import { Request, Response } from "express";
import {
  branchValidation,
  departmentValidation,
  getBranchesValidation,
  getDepartmentsValidation,
  getOrganizationValidation,
  getOrgSubsidiariesValidation,
  orgProfileValidation,
  subsidiaryValidation,
  updateBranchValidation,
  updateDepartmentValidation,
  updateSubsidiaryValidation,
} from "../../validators/SetupValidation";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import { isSubsidiaryNameUnique } from "../../../utils/unique/OrgSubsidiaryUnique";
import {
  executeAddBranch,
  executeAddDepartment,
  executeAddSubsidiary,
  executeDeactivateBranch,
  executeDeactivateDepartment,
  executeDeactivateSubsidiary,
  executeDeleteBranch,
  executeDeleteDepartment,
  executeDeleteSubsidiary,
  executeGetBranch,
  executeGetBranches,
  executeGetDepartment,
  executeGetDepartments,
  executeGetOrganization,
  executeGetSubsidiaries,
  executeUpdateBranch,
  executeUpdateDepartment,
  executeUpdateOrganization,
  executeUpdateSubsidiary,
} from "../../../respository/setup/ProfileManagementRepository";
import Subsidiary from "../../../models/Subsidiary";
import { ExcelSubsidiaryImporter } from "../../../services/imports/SubsidiaryImportService";
import { ExcelBranchImporter } from "../../../services/imports/BranchImportService";
import { ExcelDepartmentImporter } from "../../../services/imports/DepartmentImportService";

// ======================= Organization ========================

// ======= Update Organization info :
export const updateOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { error } = orgProfileValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateOrganization(req.body, transaction);
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
      message: "Failed to update organization detail.",
      error: err,
    });
  }
};

// ======= get Organization :
export const getOrganization = async (
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
  };

  const { error } = getOrganizationValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetOrganization(
      user?.organization_id,
    );

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
      message: "Failed to get Organization info.",
      error: err,
    });
  }
};

// ======================= Subsidiary =========================

// ======= Add subsidiary :
export const addSubsidiary = async (
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
  const { error } = subsidiaryValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  for (const item of payload) {
    const isUnique = await isSubsidiaryNameUnique(
      item.subsidiary_name,
      user?.organization_id
    );
    if (!isUnique) {
      errorResponse(res, {
        message: "Subsidiary name already exists",
        statusCode: 400,
      });
      return;
    }
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddSubsidiary(payload, user, transaction);
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
      message: "Failed to Create Subsidiary.",
      error: err,
    });
  }
};

// ======= get subsidiaries list :
export const getSubsidiaries = async (
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

  const { error } = getOrgSubsidiariesValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetSubsidiaries(requestData);

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
      message: "Failed to get subsidiary list.",
      error: err,
    });
  }
};

// ======== get subsidiary detail :
export const getSubsidiary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Subsidiary.findOne({
      where: { id: req.params.subsidiary_id },
    });
    if (!result) {
      errorResponse(res, {
        statusCode: 404,
        message: "Subsidiary not found",
      });
      return;
    }
    successResponse(res, {
      statusCode: 200,
      message: "Subsidiary data retrieved successfully",
      data: result,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get subsidiary Data.",
      error: err,
    });
  }
};

// ======= update subsidiary :
export const updateSubsidiary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
      error: "unauthorized",
    });
    return;
  }
  const { id } = req.params;
  const payload = req.body;
  const { error } = updateSubsidiaryValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateSubsidiary(
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
      message: "Failed to Update Subsidiary.",
      error: err,
    });
  }
};

// ==== Delete Subsidiary
export const deleteSubsidiary = async (
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
    const result = await executeDeleteSubsidiary(id, user, transaction);

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
      message: "Failed to delete subsidiary.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate Subsidiary
export const deactivateSubsidiary = async (
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
    const result = await executeDeactivateSubsidiary(id, user, transaction);
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
      message: "Failed to deactivate subsidiary.",
      error: err,
    });
  }
};

export const subsidiaryBulkUpload = async (
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
    await ExcelSubsidiaryImporter.importSubsidiaries(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Subsidiaries uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload subsidiaries.",
      error: err,
    });
  }
};

// ======================= Branches =========================
// ======= Add Branches :
export const addBranch = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const payload = Array.isArray(req.body) ? req.body : [req.body];
  const { error } = branchValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddBranch(payload, user, transaction);
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
      message: "Failed to Create Subsidiary.",
      error: err,
    });
  }
};

// ======= get Branch list :
export const getBranches = async (
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
    subsidiary_id: req.query.subsidiary_id
      ? req.query.subsidiary_id
      : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getBranchesValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetBranches(requestData);

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
      message: "Failed to get branches list.",
      error: err,
    });
  }
};

// ====== get Branch Detail:
export const getBranch = async (req: Request, res: Response): Promise<void> => {
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
    const result = await executeGetBranch(id);
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
      message: "Failed to get branch detail.",
      error: err,
    });
  }
};

// ====== updateBranch
export const updateBranch = async (
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
  const { error } = updateBranchValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateBranch(id, payload, user, transaction);
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

// ===== Delete Branch:
export const deleteBranch = async (
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
    const result = await executeDeleteBranch(id, user, transaction);
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
      message: "Failed to delete branch.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate branch
export const deactivateBranch = async (
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
    const result = await executeDeactivateBranch(id, user, transaction);
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
      message: "Failed to deactivate branch.",
      error: err,
    });
  }
};

// ========= Branch Bulk Upload:
export const branchBulkUpload = async (
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
    await ExcelBranchImporter.importBranches(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Branches uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload branches.",
      error: err,
    });
  }
};

// ===================== Departments ========================

// ======= Add Department:
export const addDepartment = async (
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
  const { error } = departmentValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeAddDepartment(payload, user, transaction);
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
      message: "Failed to Create Department.",
      error: err,
    });
  }
};

// ======= get Department list :
export const getDepartments = async (
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
    subsidiary_id: req.query.subsidiary_id
      ? req.query.subsidiary_id
      : undefined,
    subsidiary_branch_id: req.query.subsidiary_branch_id
      ? req.query.subsidiary_branch_id
      : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  const { error } = getDepartmentsValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result = await executeGetDepartments(requestData);

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
      message: "Failed to get department list.",
      error: err,
    });
  }
};

// ======= get Department Detail:
export const getDepartment = async (
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
    const result = await executeGetDepartment(id, user);
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
      message: "Failed to get department detail.",
      error: err,
    });
  }
};

// ======= update Department:
export const updateDepartment = async (
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
  const { id } = req.params;
  const payload = req.body;
  const { error } = updateDepartmentValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateDepartment(
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
      message: "Failed to update department.",
      error: err,
    });
  }
};

// ==== Deactivate / Activate Department
export const deactivateDepartment = async (
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
    const result = await executeDeactivateDepartment(id, user, transaction);
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
      message: "Failed to deactivate department.",
      error: err,
    });
  }
};
// ======= delete Department:
export const deleteDepartment = async (
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
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeleteDepartment(id, user, transaction);
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
      message: "Failed to delete department.",
      error: err,
    });
  }
};

// ====== Department Bulk Upload
export const departmentBulkUpload = async (
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
    await ExcelDepartmentImporter.importDepartments(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Departments uploaded successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload departments.",
      error: err,
    });
  }
};
