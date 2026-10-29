import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import { inviteSupplierValidation } from "../../validators/SetupValidation";
import { executeGetSupplierById, executeGetSupplierFilterOptions, executeGetSuppliers, executeInviteSuppliers, updateSupplierStatusService } from "../../../respository/setup/InviteSupplierRepository";
import User from "../../../models/User";

// ====================Suppliers ==================

// inviteSuppliers
export const inviteSuppliers = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  const { error } = inviteSupplierValidation.validate(payload, { abortEarly: false });

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
    const result = await executeInviteSuppliers(user, payload, transaction);

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
      message: "Failed to invite suppliers.",
      error: error,
    });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const { status, branch_id, department_id, page = "1", limit = "10", search, category, location, rating } = req.query;

  try {
    const result = await executeGetSuppliers(user, {
      status: status as string,
      branch_id: branch_id as string,
      department_id: department_id as string,
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      category: category as string,
      location: location as string,
      rating: rating as string,
    });

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
      pagination: {
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      },
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get suppliers.",
      error: error,
    });
  }
};

export const getSupplierFilterOptions = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const result = await executeGetSupplierFilterOptions(user);

    successResponse(res, {
      statusCode: 200,
      message: "Filter options fetched successfully",
      data: result,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch filter options",
      error,
    });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const result = await executeGetSupplierById(user, req.params.id);

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
      message: "Failed to get supplier.",
      error,
    });
  }
};

export const updateSupplierStatus = async (req: any, res: any) => {
  try {
    const supplierId = req.params.id;

    const result = await updateSupplierStatusService(supplierId, req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to update supplier.",
    });
  }
};

