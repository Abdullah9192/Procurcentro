import AppDataSource from "../../../../config/DatabaseSource";
import { executeGetBranchesAndDepartments } from "../../../respository/setup/HelperRepository";
import { errorResponse, successResponse } from "../../../utils/ResponseUtils";
import { Request, Response } from "express";

export const getBranchesAndDepartments = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }

    const organization_id = user.organization_id;
    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeGetBranchesAndDepartments(
            organization_id
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
    } catch (err) {
        await transaction.rollback();

        errorResponse(res, {
            statusCode: 500,
            message: "Failed to fetch branches and departments.",
            error: err,
        });
    }
};
