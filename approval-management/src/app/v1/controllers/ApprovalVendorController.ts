import { Request, Response } from "express";
import AppDataSource from "../../../config/DatabaseSource";
import {
    errorResponse,
    successResponse,
} from "../../utils/general/ResponseUtils";
import { updatePuchaseOrderStatusValidation } from "../validators/PurchaseOrderValidation";
import { executeCreateApprovalInventory } from "../../respository/ApprovalInventoryRepository";
import { updateVendorStatusValidation, verifyVendorDocumentValidation } from "../validators/VendorValidation";
import { executeCreateApprovalVendor, executeVerifySupplierDocument } from "../../respository/ApprovalVendorRepository";

// ========== approval inventory =========//
export const approvalApproval = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;
    const token = req.headers.authorization?.split(" ")[1];
    if (!user?.id || !user?.organization_id || !token) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }
    const organization_id = req.params.organization_id;
    const user_id = req.params.user_id;
    const { error } = updateVendorStatusValidation.validate(req.body);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();
    try {
        const result = await executeCreateApprovalVendor(
            req.body,
            user_id,
            organization_id,
            token,
        );

        if (!result.success) {
            await transaction.rollback();
            errorResponse(res, {
                statusCode: result.statusCode,
                message: result.message,
                error: result.error,
            });
            return;
        }

        await transaction.commit();
        successResponse(res, {
            statusCode: result.statusCode,
            message: result.message,
            data: result.data,
        });
    } catch (error: any) {
        await transaction.rollback();
        errorResponse(res, {
            statusCode: 500,
            message: "Failed to update vendor status.",
            error: error.message,
        });
    }
};


export const verifyVendorDocument = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;
    const token = req.headers.authorization?.split(" ")[1];
    if (!user?.id || !user?.organization_id || !token) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }
    const organization_id = req.params.organization_id;
    const user_id = req.params.user_id;
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const { error } = verifyVendorDocumentValidation.validate(payload);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();
    try {
        const result = await executeVerifySupplierDocument(
            payload,
            token,
            user_id,
            organization_id,
        );

        if (!result.success) {
            await transaction.rollback();
            errorResponse(res, {
                statusCode: result.statusCode,
                message: result.message,
                error: result.error,
            });
            return;
        }

        await transaction.commit();
        successResponse(res, {
            statusCode: result.statusCode,
            message: result.message,
            data: result.data,
        });
    } catch (error: any) {
        await transaction.rollback();
        errorResponse(res, {
            statusCode: 500,
            message: "Failed to verify document.",
            error: error.message,
        });
    }
};

