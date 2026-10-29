// repositories/approvalRequisition.repo.ts
import { Transaction } from "sequelize";
import ApprovalQuotation from "../models/ApprovalQuotation";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";

export const executeCreateApprovalQuotation = async (
    quotation_id: string,
    data: any,
    user: any,
    token: string,
    transaction?: Transaction
) => {
    try {
        const payload = {
            quotation_id,
            approval_id: user.id,
            approval_role_id: user.org_role_id,
            approval_role_name: user.user_role,
            approval_user_type: user.user_type,
            status: data?.status,
            status_reason: data?.status_reason,
        };

        await http.put(
            `/v1/update-quotation-status/${quotation_id}`,
            { status: data.status, updated_by: user.id },
            {
                baseURL: service.QUOTATION_SERVICE_URL || "http://quotation-service:5009",
                token,
            }
        );

        const created = await ApprovalQuotation.create(payload, { transaction });
        return {
            success: true,
            statusCode: 201,
            message: "Approval quotation created successfully.",
            data: created,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err?.message || "Failed to create approval quotation.",
            error: err?.message,
        };
    }
};
