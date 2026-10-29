// repositories/approvalRequisition.repo.ts
import { Transaction } from "sequelize";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";

export const executeCreateApprovalVendor = async (
    data: any,
    user_id: string,
    organization_id: string,
    token: string,
) => {
    try {
        console.log("➡️ Request Payload:", {
            user_id,
            organization_id,
            supplier_status: data?.supplier_status,
            supplier_status_reason: data?.supplier_status_reason,
            is_supplier_capable: data?.is_supplier_capable,
        });

        if (!user_id || !organization_id) {
            console.log("❌ Missing IDs");
            return {
                success: false,
                statusCode: 404,
                message: "Organization id or supplier id is missing",
            };
        }

        const result = await http.put(
            `/v1/auth/update-vendor-status`,
            {
                user_id: user_id,
                organization_id: organization_id,
                supplier_status: data?.supplier_status,
                supplier_status_reason: data?.supplier_status_reason,
                is_supplier_capable: data?.is_supplier_capable,
            },
            {
                baseURL: service.ADMIN_SERVICE_URL,
                token,
            }
        );

        console.log("✅ API Raw Response:", result);

        if (!result.success) {
            console.log("❌ API Error Response:", result.error);

            return {
                success: false,
                statusCode: result.statusCode,
                message: result.error.message,
                error: result.error,
            };
        }

        const { password, ...remainingPayload } = result?.data?.data;

        console.log("✅ Processed Data:", remainingPayload);

        return {
            success: true,
            statusCode: 200,
            message: result?.data?.message || "Vendor status updated successfully",
            data: remainingPayload,
        };
    } catch (err: any) {
        console.log("🔥 Exception Error:", err);

        return {
            success: false,
            statusCode: 500,
            message: err?.message || "Failed to create approval Inventory.",
            error: err?.message,
        };
    }
};

export const executeVerifySupplierDocument = async (
    data: any,
    token: string,
    user_id: string,
    organization_id: string,
) => {
    try {
        const result = await http.put(
            `/v1/setup/verify-supplier-document/${organization_id}/${user_id}`,
            data,
            {
                baseURL: service.VENDOR_SERVICE_URL,
                token,
            }
        );

        if (!result.success) {
            return {
                success: false,
                statusCode: result.statusCode,
                message: result.error.message,
                error: result.error,
            };
        }

        return {
            success: true,
            statusCode: 200,
            message: result?.data?.message || "Vendor status updated successfully",
            data: result,
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