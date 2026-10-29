import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../../../utils/ResponseUtils";
import { getUserTransactionsService } from "../../../respository/subscription/SubscriptionRepository";
import Subscription from "../../../models/Subscription";

export const getUserTransactionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await getUserTransactionsService(req, res);
  } catch (error: any) {
    console.error("Error in getUserTransactionsController:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

export const getAllSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => { 
  try {
    const subscriptions = await Subscription.findAll({
      order: [["created_at", "ASC"]],
    });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: (error as Error).message,
    });
  }
};
