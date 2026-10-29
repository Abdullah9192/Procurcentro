import { NextFunction, Request, Response } from "express";
import dayjs from "dayjs";
import { QueryTypes } from "sequelize";
import { errorResponse, successResponse } from "../../../utils/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import { getUserTransactionsService } from "../../../respository/subscription/SubscriptionRepository";

const calculateChange = (current: number, previous: number) => {
  if (previous === 0 && current === 0) {
    return { percentage: 0, trend: "neutral" };
  }

  if (previous === 0) {
    return { percentage: 100, trend: "up" };
  }

  const diff = ((current - previous) / previous) * 100;

  return {
    percentage: Math.abs(Number(diff.toFixed(2))),
    trend: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
  };
};

export const dashboardController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log(req.user, "user");
    const user = (req as any).user;

    // 1️⃣ Token missing / authentication failed
    if (!user) {
      return void res.status(401).json({
        message: "Authentication token missing or invalid",
      });
    }

    // 2️⃣ User exists but not linked to organization
    if (!user.organization_id) {
      return void res.status(403).json({
        message: "User is not associated with any organization",
      });
    }

    const organizationId = user.organization_id;

    const organization: any = await AppDataSource.query(
      `SELECT id FROM organizations WHERE id = :organizationId`,
      {
        replacements: { organizationId },
        type: QueryTypes.SELECT,
      },
    );

    if (!organization.length) {
      return void res.status(404).json({
        message: "Organization not found",
      });
    }


    const currentStart = dayjs().startOf("month").toDate();
    const currentEnd = dayjs().endOf("month").toDate();
    const lastStart = dayjs().subtract(1, "month").startOf("month").toDate();
    const lastEnd = dayjs().subtract(1, "month").endOf("month").toDate();

    const getCountQuery = (table: string, condition: string) => `
      SELECT COUNT(*)::int AS count
      FROM ${table}
      WHERE organization_id = :organizationId
      ${condition}
      AND "created_at" BETWEEN :start AND :end
    `;

    const executeCount = async (
      table: string,
      condition: string,
      start: Date,
      end: Date,
    ) => {
      const result: any = await AppDataSource.query(
        getCountQuery(table, condition),
        {
          replacements: { organizationId, start, end },
          type: QueryTypes.SELECT,
        },
      );
      return result[0]?.count || 0;
    };

    const [
      currentPendingReq,
      lastPendingReq,
      currentQuotation,
      lastQuotation,
      currentAwaiting,
      lastAwaiting,
      currentApproval,
      lastApproval,
      currentPO,
      lastPO,
      currentOrders,
      currentComments,
    ] = await Promise.all([
      executeCount(
        "requisitions",
        "AND status = 'pending'",
        currentStart,
        currentEnd,
      ),
      executeCount(
        "requisitions",
        "AND status = 'pending'",
        lastStart,
        lastEnd,
      ),
      executeCount(
        "quotations",
        "AND status = 'received'",
        currentStart,
        currentEnd,
      ),
      executeCount("quotations", "AND status = 'received'", lastStart, lastEnd),
      executeCount(
        "orders",
        "AND receiving_status = 'awaiting_receipt'",
        currentStart,
        currentEnd,
      ),
      executeCount(
        "orders",
        "AND receiving_status = 'awaiting_receipt'",
        lastStart,
        lastEnd,
      ),
      executeCount(
        "orders",
        "AND admin_status = 'pending_approval'",
        currentStart,
        currentEnd,
      ),
      executeCount(
        "orders",
        "AND admin_status = 'pending_approval'",
        lastStart,
        lastEnd,
      ),
      executeCount(
        "orders",
        "AND receiving_status = 'pending'",
        currentStart,
        currentEnd,
      ),
      executeCount(
        "orders",
        "AND receiving_status = 'pending'",
        lastStart,
        lastEnd,
      ),
      // All Orders
      AppDataSource.query(
        `
  SELECT id, order_gen_id, receiving_status, created_at
  FROM orders
  WHERE organization_id = :organizationId
  ORDER BY created_at DESC
  `,
        {
          replacements: { organizationId },
          type: QueryTypes.SELECT,
        }
      ),

      // All Order Comments
      AppDataSource.query(
        `
  SELECT id, status, created_at, comment
  FROM order_comments
  WHERE organization_id = :organizationId
  ORDER BY created_at DESC
  `,
        {
          replacements: { organizationId },
          type: QueryTypes.SELECT,
        }
      ),
    ]);

    const dashboardData = {
      pending_requisitions: {
        count: currentPendingReq,
        ...calculateChange(currentPendingReq, lastPendingReq),
        compared_to: "last_month",
      },
      received_quotations: {
        count: currentQuotation,
        ...calculateChange(currentQuotation, lastQuotation),
        compared_to: "last_month",
      },
      pending_approvals: {
        count: currentApproval,
        ...calculateChange(currentApproval, lastApproval),
        compared_to: "last_month",
      },
      pending_po: {
        count: currentPO,
        ...calculateChange(currentPO, lastPO),
        compared_to: "last_month",
      },
      awaiting_receipt: {
        count: currentAwaiting,
        ...calculateChange(currentAwaiting, lastAwaiting),
        compared_to: "last_month",
      },
      orders: currentOrders,
      order_comments: currentComments,
    };

    return void res.status(200).json({
      message: "Organization dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    return void res.status(500).json({
      message: "Error fetching organization dashboard data",
      error,
    });
  }
};

