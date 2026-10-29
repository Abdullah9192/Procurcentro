import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import User from "../../models/User";
import { successResponse, errorResponse } from "../../utils/ResponseUtils";
import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";
import Organization from "../../models/Organization";
import SubsidiaryBranch from "../../models/SubsidiaryBranch";
import BranchDepartment from "../../models/BranchDepartment";
import Subsidiary from "../../models/Subsidiary";
import OrgRole from "../../models/OrgRole";
import { any } from "joi";
import Subscription from "../../models/Subscription";

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      errorResponse(res, {
        statusCode: 401,
        message: "Authorization token missing",
      });
      return;
    }

    // ---- 1. User stats ----
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const inactiveUsers = await User.count({ where: { is_active: false } });

    const totalVendors = await User.count({ where: { user_type: "vendor" } });
    const totalEmployees = await User.count({ where: { user_type: "employee" } });
    const totalAdmins = await User.count({ where: { user_type: "admin" } });

    // ---- 2. Monthly users (12 months always) ----
    const currentYear = new Date().getFullYear();

    // Define the expected shape of raw result
    type MonthlyUserStats = {
      month: number;
      count: string;
    };

    const monthlyUsers = (await User.findAll({
      attributes: [
        [fn("DATE_PART", "month", col("createdAt")), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lte]: new Date(`${currentYear}-12-31`),
        },
      },
      group: [fn("DATE_PART", "month", col("createdAt"))],
      order: [[fn("DATE_PART", "month", col("createdAt")), "ASC"]],
      raw: true,
    })) as unknown as MonthlyUserStats[];

    const monthsData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthlyUsers.find((mu) => Number(mu.month) === month);
      return {
        month,
        users: found ? Number(found.count) : 0,
      };
    });

    // ---- 3. External service calls ----
    const ordersResponse = await http.get("order/v1/getorder", undefined, {
      token,
      baseURL: service.ORDER_SERVICE_URL,
    });
    console.log("Orders API Response:", ordersResponse);

    const quotationsResponse = await http.get("quotation/v1/getallquotations", undefined, {
      token,
      baseURL: service.QUOTATION_SERVICE_URL,
    });
    console.log("Quotations API Response:", quotationsResponse);

    // ✅ Debugging responses
    console.log("Orders API Raw Response:", JSON.stringify(ordersResponse.data, null, 2));
    console.log("Quotations API Raw Response:", JSON.stringify(quotationsResponse.data, null, 2));

    const orders = ordersResponse?.data?.data || [];
    const quotations = quotationsResponse?.data?.data || [];

    console.log("Extracted Orders Length:", orders.length);
    console.log("Extracted Quotations Length:", quotations.length);

    const totalOrders = orders.length;
    const totalQuotations = quotations.length;

    // ---- Response ----
    successResponse(res, {
      statusCode: 200,
      message: "Dashboard stats fetched successfully",
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          vendors: totalVendors,
          employees: totalEmployees,
          admins: totalAdmins,
          monthly: monthsData,
        },
        orders: totalOrders,
        quotations: totalQuotations,
      },
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: err?.response?.status || 500,
      message: err?.response?.data?.message || "Failed to fetch dashboard stats.",
      error: err?.message || "Internal error",
    });
  }
};

// Define result shapes
type MonthlyActiveStats = {
  month: number;
  count: string;
};

type CountryStats = {
  country: string;
  count: string;
};

export const getUserAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      errorResponse(res, {
        statusCode: 401,
        message: "Authorization token missing",
      });
      return;
    }

    // ---- 1. Total users ----
    const totalUsers = await User.count();

    // ---- 2. Monthly active users ----
    const currentYear = new Date().getFullYear();

    const monthlyActive = (await User.findAll({
      attributes: [
        [fn("DATE_PART", "month", col("createdAt")), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        is_active: true,
        createdAt: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lte]: new Date(`${currentYear}-12-31`),
        },
      },
      group: [fn("DATE_PART", "month", col("createdAt"))],
      order: [[fn("DATE_PART", "month", col("createdAt")), "ASC"]],
      raw: true,
    })) as unknown as MonthlyActiveStats[];

    const monthlyActiveData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = monthlyActive.find((m) => Number(m.month) === month);
      return {
        month,
        active_users: found ? Number(found.count) : 0,
      };
    });

    // ---- 3. Users grouped by country ----
    const usersByCountry = (await User.findAll({
      attributes: [
        "country",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["country"],
      raw: true,
    })) as unknown as CountryStats[];

    // ---- Response ----
    successResponse(res, {
      statusCode: 200,
      message: "User analytics fetched successfully",
      data: {
        total_users: totalUsers,
        monthly_active: monthlyActiveData,
        by_country: usersByCountry.map((c) => ({
          country: c.country || "Unknown",
          users: Number(c.count),
        })),
      },
    });
  } catch (err: any) {
    console.error("Error in getUserAnalytics:", err);
    errorResponse(res, {
      statusCode: err?.response?.status || 500,
      message:
        err?.response?.data?.message || "Failed to fetch user analytics.",
      error: err?.message || "Internal error",
    });
  }
};

export const getUserDetails = async (id: string) => {
  // --- 1. Find user ---
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }

  const {
    organization_id,
    branch_department_id,
    subsidiary_id,
    subsidiary_branch_id,
    org_role_id,
  } = user;

  // --- 2. Organization ---
  let organization = null;
  if (organization_id) {
    organization = await Organization.findByPk(organization_id);
  }

  // --- 3. Subsidiary Branches count ---
  let subBranchCount = 0;
  if (subsidiary_id && branch_department_id) {
    subBranchCount = await SubsidiaryBranch.count({
      where: {
        subsidiary_id: subsidiary_id,
        id: branch_department_id,
      },
    });
  }

  const TotalBranches = await SubsidiaryBranch.count({
    where: {
      subsidiary_id: subsidiary_id!, // non-null assertion
    },
  });

  // --- 4. Branch Departments count ---
  let branchDeptCount = 0;
  if (subsidiary_id && subsidiary_branch_id) {
    branchDeptCount = await BranchDepartment.count({
      where: {
        subsidiary_id: subsidiary_id,
        id: subsidiary_branch_id,
      },
    });
  }
  const TotalDepartments = await BranchDepartment.count({
    where: {
      subsidiary_id: subsidiary_id!,  // non-null assertion if you know it's not null
    },
  });


  // --- 5. Subsidiaries count ---
  const subWhere: any = {};
  if (organization_id) subWhere.organization_id = organization_id;
  if (subsidiary_id) subWhere.id = subsidiary_id;

  const TotalSubsidiaries = await Subsidiary.count({ where: subWhere });

  // --- 6. Employee count ---
  const employeeCount = await User.count({
    where: { organization_id, user_type: "employee" },
  });

  // --- 7. Vendor count ---
  const vendorCount = await User.count({
    where: { organization_id, user_type: "vendor" },
  });

  // --- 8. Admin count ---
  const designationCount = await User.count({
    where: { organization_id, user_type: "admin" },
  });

  // --- 8. Org Roles unique count ---
  let roleWhere: any = {};
  if (org_role_id) roleWhere.id = org_role_id;
  if (organization_id) roleWhere.organization_id = organization_id;

  const roles = await OrgRole.findAll({ where: roleWhere });
  const uniqueRoles = new Set(roles.map((r) => r.role_name));

  return {
    user,
    organization,
    TotalBranches,
    TotalDepartments,
    TotalSubsidiaries,
    employeeCount,
    vendorCount,
    designationCount,
    totalroles: uniqueRoles.size,
  };
};

export const getprocurementStats = async (
  organization_id: string,
  token: string
) => {
  try {
    const quotationsResponse = await http.get(
      `v1/quotations/${organization_id}`, // endpoint on quotation service
      undefined,
      {
        token,
        baseURL: service.QUOTATION_SERVICE_URL,
      }
    );

    const ordersResponse = await http.get(
      `/v1/orders/${organization_id}`, // endpoint on quotation service
      undefined,
      {
        token,
        baseURL: service.ORDER_SERVICE_URL,
      }
    );

    const quotations = quotationsResponse.data.data || [];
    const orders = ordersResponse.data?.data || [];

    // 🔹 Apply filters
    const totalRFQCreated = quotations.length;
    const totalOrders = orders.length;

    const totalNonPending = quotations.filter(
      (q: any) => q.status !== "pending_response"
    ).length;

    const totalRecieved = quotations.filter(
      (q: any) => q.receiving_status !== "received"
    ).length;

    const totalRejected = quotations.filter(
      (q: any) => q.status === "rejected"
    ).length;

    const totalCanceled = quotations.filter(
      (q: any) => q.receiving_status === "rejected"
    ).length;

    return {
      totalRFQCreated,
      totalNonPending,
      totalRejected,
      totalOrders,
      totalRecieved,
      totalCanceled
    };
  } catch (error: any) {
    throw {
      statusCode: error?.response?.status || 500,
      message: error?.response?.data?.message || "Failed to fetch quotations",
      error,
    };
  }
};

export const getAllSubscriptions = async (req: Request,res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.findAll({
      order: [['createdAt', 'DESC']], // newest first
    });

      res.status(200).json({
      success: true,
      message: 'Subscriptions fetched successfully',
      data: subscriptions,
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
      res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching subscriptions',
      error: error.message,
    });
  }
};
