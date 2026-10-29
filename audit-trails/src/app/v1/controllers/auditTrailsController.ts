import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { Request, Response } from "express";

import {
  createAuditLogsRepository,
  getAuditLogByIdRepository,
  getUserAuditLogsRepository,
} from "../../respository/auditLogsRepository";
import { User } from "../../types/userTypes";
import { createAuditLogValidation } from "../validators/auditTrailsValidator";
import { GetAuditLogsQuery } from "../../types/auditLogTypes";

// ===== create log
export const createAuditLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as User;

    const { error } = await createAuditLogValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: "Bad Request",
        error: error,
      });
    }

    const result = await createAuditLogsRepository(user, req.body);
    successResponse(res, {
      message: "",
      data: result,
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};

// ===== get all logs
export const getAuditLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.query.subsidiary_id) {
      errorResponse(res, {
        statusCode: 400,
        message: "Bad Request",
        error: "subsidiary_id is required",
      });
    }
    const token = req.headers.authorization?.split(" ")[1] ?? "";

    const user = req.user as User;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = req.query as GetAuditLogsQuery;
    const result = await getUserAuditLogsRepository(
      user,
      page,
      limit,
      query,
      token
    );
    successResponse(res, {
      message: "",
      data: result,
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};

// ===== get Audit log by id
export const getAuditLogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getAuditLogByIdRepository(req.params.id);
    successResponse(res, {
      message: "",
      data: result,
    });
  } catch (error) {
    console.log(error);
    errorResponse(res, {
      statusCode: 500,
      message: "Server Error",
      error: error,
    });
  }
};
