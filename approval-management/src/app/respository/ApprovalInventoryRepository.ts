// repositories/approvalRequisition.repo.ts
import { Transaction } from "sequelize";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";
import ApprovalInventory from "../models/ApprovalInventory";

export const executeCreateApprovalInventory = async (
    inventory_id: string,
    data: any,
    user: any,
    token: string,
    transaction?: Transaction
) => {
    try {
        const payload = {
            inventory_id: inventory_id,
            approval_id: user.id,
            approval_role_id: user.org_role_id,
            approval_role_name: user.user_role,
            approval_user_type: user.user_type,
            status: data?.status,
            status_reason: data?.status_reason,
        };

        await http.post(
            `/v1/product/:id/${inventory_id}`,
            { status: data.status, updated_by: user.id },
            {
                baseURL: service.QUOTATION_SERVICE_URL || "http://organization-inventory-service:5007",
                token,
            }
        );

        const created = await ApprovalInventory.create(payload, { transaction });


        return {
            success: true,
            statusCode: 201,
            message: "Approval Inventory created successfully.",
            data: created,
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err?.message || "Failed to create approval Inventory.",
            error: err?.message,
        };
    }
};
