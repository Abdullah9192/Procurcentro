import { Request, Response } from "express";
import AppDataSource from "../../../config/DatabaseSource";
import {
    errorResponse,
    successResponse,
} from "../../utils/general/ResponseUtils";
import { updatePuchaseOrderStatusValidation } from "../validators/PurchaseOrderValidation";
import { executeCreateApprovalPurchaseOrder } from "../../respository/ApprovalPurchaseOrderRepository";

// ========== approval quotation =========//
export const approvalPurchaseOrder = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;
    const { purchase_order_id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    if (!user?.id || !user?.organization_id || !token) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }
    const { error } = updatePuchaseOrderStatusValidation.validate(req.body);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();
    try {
        const result = await executeCreateApprovalPurchaseOrder(
            purchase_order_id,
            req.body,
            user,
            token,
            transaction
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
            message: "Failed to create approval purchase order.",
            error: error.message,
        });
    }
};


