import AppDataSource from "../../../config/DatabaseSource";
import { Request, Response } from "express";
import { executeBoldSignWebhook, executeCreateOrderContract, executeDownloadOrderContract, executeSendOrderContractBoldSign } from "../../repository/PurchaseOrderContractRepository";
import { errorResponse, successResponse } from "../../utils/ResponseUtils";
import { createOrderContractSchema } from "../validators/ContractValidation";


export const createOrderContract = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;

    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "user authentication required",
            statusCode: 401,
        });
        return;
    }

    const { error, value } =
        createOrderContractSchema.validate(req.body);
    console.log('create order payload:::::::', req.body);

    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeCreateOrderContract(
            value,
            user,
            transaction
        );

        if (!result.success) {
            await transaction.rollback();

            errorResponse(res, {
                statusCode: result.statusCode,
                message: result.message,
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
            message: error.message,
        });
    }
};

export const sendOrderContractBoldSign = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;

    const { id } = req.params;

    try {
        const result =
            await executeSendOrderContractBoldSign(
                id,
                user
            );

        if (!result.success) {
            errorResponse(res, {
                statusCode: result.statusCode,
                message: result.message,
            });
            return;
        }

        successResponse(res, {
            statusCode: result.statusCode,
            message: result.message,
            data: result.data,
        });
    } catch (error: any) {
        errorResponse(res, {
            statusCode: 500,
            message: error.message,
        });
    }
};

export const boldSignWebhook = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const result = await executeBoldSignWebhook(req.body);

        res.status(200).json({
            success: true,
            message: "Webhook processed",
            data: result,
        });
    } catch (error: any) {
        console.error("BoldSign webhook error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const downloadOrderContract = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { purchaseOrderId } = req.params;

    try {
        const result = await executeDownloadOrderContract(
            purchaseOrderId
        );

        if (!result.success) {
            errorResponse(res, {
                statusCode: result.statusCode,
                message: result.message || "Something went wrong",
            });
            return;
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="order-contract.pdf"'
        );
        res.send(result.file);
        return;
        
    } catch (error: any) {
        errorResponse(res, {
            statusCode: 500,
            message: error.message,
        });
    }
};