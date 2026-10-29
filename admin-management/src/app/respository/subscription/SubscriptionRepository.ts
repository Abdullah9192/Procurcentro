import { Request, Response } from "express";
import Subscription from "../../models/Subscription";
import { successResponse, errorResponse } from "../../utils/ResponseUtils";
import TransactionHistory from "../../models/TransactionHistory";

export const getUserTransactionsService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      errorResponse(res, {
        statusCode: 400,
        message: "User ID is required",
      });
      return;
    }

    const transactions = await TransactionHistory.findAll({
      where: { user_id },
      order: [["date", "DESC"]],
    });

    if (!transactions.length) {
      successResponse(res, {
        statusCode: 200,
        message: "No transactions found for this user",
        data: [],
      });
      return;
    }

    const planNames = [...new Set(transactions.map((t) => t.subscription_plan))];

    const subscriptions = await Subscription.findAll({
      where: { subscription_plan: planNames },
    });

    const mergedData = transactions.map((txn) => {
      const relatedPlan = subscriptions.find(
        (sub) => sub.subscription_plan === txn.subscription_plan
      );
      return {
        ...txn.toJSON(),
        subscription_details: relatedPlan || null,
      };
    });

    successResponse(res, {
      statusCode: 200,
      message: "User transaction history fetched successfully",
      data: mergedData,
    });
  } catch (error: any) {
    console.error("Error fetching user transactions:", error);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch user transaction history",
      error: error.message,
    });
  }
};
