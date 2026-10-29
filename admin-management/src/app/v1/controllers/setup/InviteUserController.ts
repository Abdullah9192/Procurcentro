import { Request, Response } from "express";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import {
  executeAddRole,
  executeDeactivateRole,
  executeDeactivateUser,
  executeDeleteRole,
  executeGetAdminUsersList,
  executeGetOrganizationEmployeeList,
  executeGetPermissionModules,
  executeGetRole,
  executeGetRoles,
  executeInviteAdmin,
  executeInviteUsers,
  executeTransferOwnerShip,
  executeUpdateRole,
  executeGetUsersByIds,
  executeUpdateUser,
  executeAcceptInvite,
} from "../../../respository/setup/InviteUserRepository";
import {
  addAdminValidation,
  addUserValidation,
  orgRoleValidation,
  updateOrgRoleValidation,
  updateUserValidation,
} from "../../validators/SetupValidation";
import { ExcelInviteUserImporter } from "../../../services/imports/InviteUserImportService";

// =================== Roles ==============================

// ===== get roles list
export const getRoles = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const requestData = {
    page: !isNaN(page) && page > 0 ? page : undefined,
    limit: !isNaN(limit) && limit > 0 ? limit : undefined,
    search: req.query.search as string,
  };

  try {
    const result = await executeGetRoles(requestData, user);
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
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch the Organization Roles List",
    });
  }
};

// ======= Add Roles :
export const addRole = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }
  const payload = req.body;
  const { error } = orgRoleValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeAddRole(payload, user, transaction);
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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to add organization role.",
    });
  }
};

// Update Role Data ;
export const updateRole = async (
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

  const roleId = req.params.id;
  const payload = req.body;

  const { error } = updateOrgRoleValidation.validate(payload);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeUpdateRole(roleId, payload, user, transaction);

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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update organization role.",
    });
  }
};

// Get Role Detail By Id
export const getRole = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const roleId = req.params.id;

  try {
    const result = await executeGetRole(roleId, user.organization_id);

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
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to retrieve organization role.",
    });
  }
};

// Delete Role Data
export const deleteRole = async (
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

  const roleId = req.params.id;
  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeDeleteRole(
      roleId,
      user.organization_id,
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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to delete organization role.",
    });
  }
};

// ==== Deactivate / Activate Role
export const deactivateRole = async (
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
    const result = await executeDeactivateRole(id, user, transaction);
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
      message: "Failed to deactivate Role.",
      error: err,
    });
  }
};

// ======================== Invite Admin  ====================

// getOrganizationEmployeeList
export const getOrganizationEmployeeList = async (
  req: Request,
  res: Response
) => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string; // new status filter

    const result = await executeGetOrganizationEmployeeList(
      user,
      page,
      limit,
      search,
      status
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
      pagination: result.pagination,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch the employees list.",
    });
  }
};

//  getAdminUsersList
export const getAdminUsersList = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const result = await executeGetAdminUsersList(user);

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
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch the admin users list.",
    });
  }
};

// deactivateUser
export const deactivateUser = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeactivateUser(
      user,
      req.params.user_id,
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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to deactivate user.",
    });
  }
};

// transferOwnerShip
export const transferOwnerShip = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeTransferOwnerShip(
      user,
      req.params.user_id,
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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to transfer ownership.",
    });
  }
};

// =================== Permission Modules =============

// getPermissionModules
export const getPermissionModules = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const result = await executeGetPermissionModules();

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
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch the permission modules list.",
    });
  }
};

// ======================== Invite Users ================

// inviteUsers
export const inviteUsers = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  const { error } = addUserValidation.validate(payload, { abortEarly: false });

  if (error) {
    const messages = error.details.map((e) => e.message).join(", ");
    errorResponse(res, {
      statusCode: 400,
      message: `Validation Error: ${messages}`,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeInviteUsers(user, payload, transaction);

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
  } catch (error: any) {
    await transaction.rollback();
    console.log("Original Error Exits:", error.original.message);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to invite users.",
      error: error,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const { error } = updateUserValidation.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map((e) => e.message).join(", ");
    errorResponse(res, {
      statusCode: 400,
      message: `Validation Error: ${messages}`,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeUpdateUser(
      user,
      req.params.id,
      req.body,
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
  } catch (error: any) {
    await transaction.rollback();

    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update user.",
      error,
    });
  }
};

// inviteUsersBulkUpload
export const inviteUsersBulkUpload = async (
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
    await ExcelInviteUserImporter.importInviteUsers(req.file.path, user);
    successResponse(res, {
      statusCode: 200,
      message: "Invite Users successfully.",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload Users Data.",
      error: err,
    });
  }
};

// inviteAdmin
export const inviteAdmin = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return
  }

  const payload = req.body;
  const { error } = addAdminValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return
  }


  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeInviteAdmin(user, payload, transaction);

    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return
    }

    await transaction.commit();

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data
    });
    return

  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: error?.message || "Failed to invite admin.",
    });
    return
  }
};

export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token) {
    errorResponse(res, {
      statusCode: 400,
      message: "Token is required",
    });
  }

  try {
    const result = await executeAcceptInvite(token as string);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
    }
    const redirectUrl = `${process.env.ADMIN_FRONTEND_URL}/set-password`;
    res.redirect(`${redirectUrl}?email=${result.data?.email}`);


  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: error?.message || "Failed to accept invite.",
    });
  }
};

// get Users by id
export const getUsersByIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.body.ids) {
      errorResponse(res, {
        statusCode: 400,
        message: "Ids are required",
      });
    }
    const result = await executeGetUsersByIds(req.body.ids);
    successResponse(res, {
      statusCode: 200,
      message: "",
      data: result,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch the users list.",
    });
  }
};
