// repositories/approvalRequisition.repo.ts
import { Transaction } from "sequelize";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import ApprovalBudget from "../models/ApprovalBudget";

export const executeCreateApprovalBudget = async (
  budget_id: string,
  data: any,
  user: any,
  token: string,
  transaction?: Transaction
) => {
  try {
    const payload = {
      budget_id: budget_id,
      approval_id: user.id,
      approval_role_id: user.org_role_id,
      approval_role_name: user.user_role,
      approval_user_type: user.user_type,
      status: data.status,
      status_reason: data.status_reason,
    };

    await http.put(
      `/v1/status-budget/${budget_id}`,
      { status: data.status , updated_by : user.id},
      {
        baseURL: service.BUDGET_SERVICE_URL || "http://budget-service:5005",
        token,
      }
    );
    const created = await ApprovalBudget.create(payload, { transaction });

    return {
      success: true,
      statusCode: 201,
      message: "Approval requisition created successfully.",
      data: created,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create approval requisition.",
      error: err?.message,
    };
  }
};
