import { Request, Response } from "express";
import AppDataSource from "../../../config/DatabaseSource";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { updateBudgetStatusValidation } from "../validators/BudgetValidation";
import { executeCreateApprovalBudget } from "../../respository/ApprovalBudgetRepository";

// approvalBudget
export const approvalBudget = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { budget_id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.organization_id || !token) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { error } = updateBudgetStatusValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeCreateApprovalBudget(
      budget_id,
      req.body,
      user,
      token,
      transaction
    );

    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result.error,
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
      message: "Failed to create approval budget.",
      error: error.message,
    });
  }
};
