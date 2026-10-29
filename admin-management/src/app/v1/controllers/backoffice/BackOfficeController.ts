import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";
import { getDashboardStats, getprocurementStats, getUserAnalytics, getUserDetails } from "../../../respository/backoffice/UserManagement";
import BranchDepartment from "../../../models/BranchDepartment";
import SubsidiaryBranch from "../../../models/SubsidiaryBranch";
import User from "../../../models/User";
import Organization from "../../../models/Organization";


export const userManagementController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await getDashboardStats(req, res);
  } catch (error: any) {
    console.error("Error in dashboardStatsController:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

export const dashboardStatsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await getUserAnalytics(req, res);
  } catch (error: any) {
    console.error("Error in dashboardStatsController:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

export const userDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; 
    const data = await getUserDetails(id); 

    successResponse(res, {
      statusCode: 200,
      message: "User details fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error in userDetailsController:", error);
    errorResponse(res, {
      message: error.message || "Unexpected error occurred",
      statusCode: 500,
    });
  }
};

export const getOrganizationEmployeeUsers = async (req: Request, res: Response) => {
  try {
    const { organization_id } = req.params;

    const users = await User.findAll({
      where: {
        organization_id,
        user_type: "employee"
      },
      include: [
        {
          model: SubsidiaryBranch,
          as: "subsidiary_branch",
          attributes: ["id", "branch_name"],
          required: false, 
        },
        {
          model: BranchDepartment,
          as: "branch_department",
          attributes: ["id", "department_name"],
          required: false, 
        },
      ],
    });

    const formattedUsers = users.map((user: any) => ({
      ...user.toJSON(),
      branch_id: user.subsidiary_branch_id || 0,
      branch_name: user.branch ? user.branch.name : null,
      department_id: user.branch_department_id || 0,
      department_name: user.department ? user.department.name : null,
    }));

    res.status(200).json({
      success: true,
      status_code: 200,
      message: "Employee Users fetched successfully",
      data: formattedUsers,
    });
  } catch (error: any) {
    console.error("Error fetching employee users:", error);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const procurementActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { organization_id } = req.params;
    const token = (req as any).token || req.headers.authorization?.split(" ")[1];

    if (!organization_id) {
      errorResponse(res, {
        statusCode: 400,
        message: "Organization ID is required",
      });
      return;
    }

    const result = await getprocurementStats(organization_id, token);

    successResponse(res, {
      statusCode: 200,
      message: "Quotation statistics fetched successfully",
      data: result,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: error?.statusCode || 500,
      message: error?.message || "Failed to fetch quotation statistics",
      error: error?.error || error?.message,
    });
  }
};

export const getOrganizationSuppliers = async (req: Request, res: Response) => {
  try {
    const { organization_id } = req.params;

    const users = await User.findAll({
      where: {
        organization_id,
        user_type: "vendor"
      },
      include: [
        {
          model: Organization,
          as: "organization",
          required: false, 
        }
      ],
    });

    res.status(200).json({
      success: true,
      status_code: 200,
      message: "Employee Users fetched successfully",
      users,
    });
  } catch (error: any) {
    console.error("Error fetching employee users:", error);
    res.status(500).json({
      success: false,
      status_code: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
};