import { Request, Response } from "express";
import { getModulesValidation, organizationSettingsValidation } from "../../validators/SetupValidation";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";
import AppDataSource from "../../../../config/DatabaseSource";
import { executeGetModules, executeUpsertOrganizationSettings } from "../../../respository/setup/OrganizationSettingRepository";

// ======= Create Module :
export const upsertOrganizationSettings = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    if (
        !user?.id ||
        !user?.email ||
        !user?.is_active ||
        !user?.organization_id
    ) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }

    const { error } = organizationSettingsValidation.validate(req.body);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeUpsertOrganizationSettings(req.body, user, transaction);

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
            message: "Failed to save organization settings.",
            error: err,
        });
    }
};

// ======= get Modules list :
export const getModules = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;

    if (
        !user?.id ||
        !user?.email ||
        !user?.is_active ||
        !user?.organization_id
    ) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }
    const requestData = {
        organization_id: user?.organization_id,
        subsidiary_id: req.query.subsidiary_id ? req.query.subsidiary_id : undefined,
        type: req.query.type ? req.query.type : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    console.log("requestData", requestData);
    const { error } = getModulesValidation.validate(requestData);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }


    try {
        const result = await executeGetModules(requestData);

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
    } catch (err) {
        errorResponse(res, {
            statusCode: 500,
            message: "Failed to get modules list.",
            error: err,
        });
    }
};

