// repositories/approvalRequisition.repo.ts
import { Transaction } from "sequelize";
import ApprovalRequisition from "../models/ApprovalRequisition";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";

export const executeCreateApprovalRequisition = async (
  requisition_id: string,
  data: any,
  user: any,
  token : string,
  transaction?: Transaction
) => {
  try {
    const payload = {
      requisition_id,
      approval_id: user.id,
      approval_role_id: user.org_role_id,
      approval_role_name: user.user_role,
      approval_user_type: user.user_type,
      status: data.status,
      status_reason: data.status_reason,
    };

    await http.put(
      `/v1/requisition-status/${requisition_id}`,
      { status: data.status , updated_by : user.id},
      {
        baseURL: service.REQUISITION_SERVICE_URL,
        token,
      }
    );

    const created = await ApprovalRequisition.create(payload, { transaction });

    
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
