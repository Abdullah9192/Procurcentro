// repositories/approvalRequisition.repo.ts
import { Transaction } from "sequelize";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import ApprovalPurchaseOrder from "../models/ApprovalPurchaseOrder";

export const executeCreateApprovalPurchaseOrder = async (
    purchase_order_id: string,
    data: any,
    user: any,
    token: string,
    transaction?: Transaction
) => {
    try {
        const payload = {
            order_id: purchase_order_id,
            approval_id: user.id,
            approval_role_id: user.org_role_id,
            approval_role_name: user.user_role,
            approval_user_type: user.user_type,
            status: data?.status,
            status_reason: data?.status_reason,
        };
        const payloaded = {
            order_id: purchase_order_id,
            approval_id: user.id,
            approval_role_id: user.org_role_id,
            approval_role_name: user.user_role,
            approval_user_type: user.user_type,
            status_reason: data?.status_reason,
        };

        await http.put(
            `/v1/update-status/${purchase_order_id}`,
            { admin_status: data.status, updated_by: user.id },
            {
                baseURL: service.PURCHASE_ORDER_SERVICE_URL || "http://order-service:50010",
                token,
            }
        );

        const created = await ApprovalPurchaseOrder.create(payloaded, { transaction });


        return {
            success: true,
            statusCode: 201,
            message: "Approval purchase order created successfully.",
            data: created,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err?.message || "Failed to create approval purchase order.",
            error: err?.message,
        };
    }
};
