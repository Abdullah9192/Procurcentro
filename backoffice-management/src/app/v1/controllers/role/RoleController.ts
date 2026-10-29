import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/general/ResponseUtils";
import { createRole, updateRole, deleteRole, getRoleById, listRoles, assignRoleToUsers } from "../../../respository/role/RoleRepository";
import BackofficePermission from "../../../models/BackofficePermission";

export const addRole = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email) {
    return errorResponse(res, { statusCode: 401, message: "User authentication required" });
  }

  try {
    const { role, permissions } = req.body;
    if (!role) {
      return errorResponse(res, { statusCode: 400, message: "Role name is required" });
    }

    const newRole = await createRole({ role, permissions });
    return successResponse(res, { statusCode: 201, message: "Role created successfully", data: newRole });
  } catch (err: any) {
    return errorResponse(res, { statusCode: 500, message: err.message || "Failed to create role" });
  }
};

export const editRole = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email) {
    return errorResponse(res, { statusCode: 401, message: "User authentication required" });
  }

  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const updatedRole = await updateRole(id, { role, permissions });
    return successResponse(res, { statusCode: 200, message: "Role updated successfully", data: updatedRole });
  } catch (err: any) {
    return errorResponse(res, { statusCode: 500, message: err.message || "Failed to update role" });
  }
};

export const removeRole = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email) {
    return errorResponse(res, { statusCode: 401, message: "User authentication required" });
  }

  try {
    const { id } = req.params;
    const deletedRole = await deleteRole(id);
    return successResponse(res, { statusCode: 200, message: "Role deleted successfully", data: deletedRole });
  } catch (err: any) {
    return errorResponse(res, { statusCode: 500, message: err.message || "Failed to delete role" });
  }
};

export const getRole = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email) {
    return errorResponse(res, { statusCode: 401, message: "User authentication required" });
  }

  try {
    const { id } = req.params;
    const role = await getRoleById(id);
    return successResponse(res, { statusCode: 200, message: "Role fetched successfully", data: role });
  } catch (err: any) {
    return errorResponse(res, { statusCode: 500, message: err.message || "Failed to fetch role" });
  }
};

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await listRoles();
    return successResponse(res, { statusCode: 200, message: "Roles fetched successfully", data: roles });
  } catch (err: any) {
    return errorResponse(res, { statusCode: 500, message: err.message || "Failed to fetch roles" });
  }
};

export const assignRoleController = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { user_ids, role, permissions } = req.body;

    const result = await assignRoleToUsers({ user_ids, role, permissions ,sender_id: authUser.id ,organization_id: authUser.organization_id, });

    return successResponse(res, {
      statusCode: 200,
      message: 'Role and permissions assigned successfully',
      data: result.updated_users,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to assign role',
    });
  }
};

export const getAllPermissionsController = async (req: Request, res: Response) => {
  try {
    const permissions = await BackofficePermission.findAll();

    return successResponse(res, {
      statusCode: 200,
      message: 'Permissions fetched successfully',
      data: permissions,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err?.statusCode || 500,
      message: err?.message || 'Failed to fetch permissions',
    });
  }
};