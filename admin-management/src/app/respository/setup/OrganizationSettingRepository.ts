import { Transaction } from "sequelize";
import { BaseService } from "../../services/BaseService";
import OrganizationSetting from "../../models/OrganizationSetting";
import Organization from "../../models/Organization";
import Subsidiary from "../../models/Subsidiary";
import User from "../../models/User";

const organizationSettingsService = new BaseService(OrganizationSetting);

export const executeUpsertOrganizationSettings = async (
    data: any,
    user: any,
    transaction: Transaction
) => {
    const organization_id = user?.organization_id;

    const enrichedPayload = {
        ...data,
        organization_id,
        created_by: user?.id,
    };

    const existingSettings = await organizationSettingsService.findOne({
        where: {
            organization_id,
            subsidiary_id: data?.subsidiary_id || null,
            type: data?.type,
        }
    });

    let savedRecords;
    let message;
    let statusCode;

    if (existingSettings) {
        savedRecords = await organizationSettingsService.update(
            { settings: data?.settings },
            {
                where: {
                    id: existingSettings.id
                },
                transaction,
                returning: true
            }
        );

        message = "Settings Updated Successfully!";
        statusCode = 200;
    } else {
        savedRecords = await organizationSettingsService.create(enrichedPayload, { transaction });
        message = "Settings Created Successfully!";
        statusCode = 201;
    }

    return {
        success: true,
        statusCode,
        message,
        data: savedRecords
    };
};

export const executeGetModules = async (
    requestData: any,
) => {
    let result;

    const { page, limit, organization_id, subsidiary_id, type } = requestData
    const whereCondition: any = {
        organization_id: organization_id,
    };

    if (subsidiary_id) {
        whereCondition.subsidiary_id = subsidiary_id;
    }


    if (type) {
        whereCondition.type = type;
    }

    const includeOptions = [
        {
            model: Organization,
            as: 'organization',
        },
        {
            model: Subsidiary,
            as: 'subsidiary',
        },
        {
            model: User,
            as: 'creator',
        }
    ];

    if (page && limit) {
        result = await organizationSettingsService.paginate({
            page,
            limit,
            options: {
                where: whereCondition,
                include: includeOptions,
            }
        });
    } else {
        const workflowList = await organizationSettingsService.findAll({
            where: whereCondition,
            include: includeOptions
        });
        result = {
            data: workflowList,
            total: workflowList.length,
            pages: 1
        };
    }

    return {
        success: true,
        statusCode: 200,
        message: "Modules list fetched successfully",
        data: result
    };
};