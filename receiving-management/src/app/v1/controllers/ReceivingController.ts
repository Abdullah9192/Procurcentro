import { Request, Response } from "express";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { executeGetReceivingDetail } from "../../respository/ReceivingRepository";
// getReceivingDetail
export const getReceivingDetail = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.email || !user?.is_active || !token) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  try {
    const result = await executeGetReceivingDetail(id, token , user);
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
      message: "Failed to get receiving lists.",
      error: err,
    });
  }
};