import { Op, Sequelize, Transaction } from "sequelize";
import { generateRequestId } from "../services/OrgSettingService";
import Requisition from "../models/Requisition";
import ExternalRequisitionService from "../models/ExternalRequisitionService";
import ExternalRequisitionServiceAttachment from "../models/ExternalRequisitionServiceAttachment";
import { resolveRequisitionRelations } from "../services/RequisitionGrpcService";
import InternalRequisitionService from "../models/InternalRequisitionService";
import InternalRequisitionServiceAttachment from "../models/IneterRequisitionServiceAttachment";

export const executeCreateExternalServiceRequisition = async (
    data: any,
    user: any,
    token: string,
    transaction: Transaction
) => {
    const organization_id = user?.organization_id;
    const created_by = user?.id;

    try {
        let request_id = await generateRequestId(organization_id, token);
        const { external_services, type, request_type, ...updatedData } = data;
        const requisition = await Requisition.create(
            {
                ...updatedData,
                created_by,
                status: "pending",
                type: type || "external",
                request_type: request_type || "service",
                organization_id,
                request_id,
                last_action_by: created_by,
            },
            { transaction }
        );

        let externalServiceData = [];
        if (external_services.length > 0) {
            for (let i = 0; i < external_services.length; i++) {
                const ser = external_services[i];
                const { attachments, ...extServiceData } = ser;
                const createdItem = await ExternalRequisitionService.create(
                    {
                        ...extServiceData,
                        requisition_id: requisition.id,
                        use_type: extServiceData?.use_type,
                        frequency: extServiceData?.frequency,
                        total_price: extServiceData?.total_price,
                    },
                    { transaction }
                );
                let serviceAttachments = [];
                if (attachments && Array.isArray(attachments) && attachments.length > 0) {
                    for (let j = 0; j < attachments.length; j++) {
                        const attachment = attachments[j];
                        const createdAttachment = await ExternalRequisitionServiceAttachment.create(
                            {
                                external_requisition_service_id: createdItem.id,
                                file_name: attachment.file_name,
                                file_url: attachment.file_url,
                            },
                            { transaction }
                        );
                        serviceAttachments.push(createdAttachment);

                    }
                }
                externalServiceData.push({
                    ...createdItem.toJSON(),
                    attachments: serviceAttachments
                });
            }
        }
        return {
            success: true,
            statusCode: 201,
            message: "External Service Requisition created successfully.",
            data: {
                ...requisition.toJSON(),
                external_services: externalServiceData
            },
        };

    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.errors?.[0]?.message || err.message || "Failed to create external service requisition.",
            error: err?.message || String(err),
        };
    }
};


export const executeGetExternalServiceRequisitions = async (payload: any) => {
    const { page, limit, subsidiary_id, organization_id, search } = payload;
    try {
        const whereCondition: any = {
            organization_id,
        };
        if (subsidiary_id) {
            whereCondition.subsidiary_id = subsidiary_id;
        }

        if (!page && !limit) {
            const requisitions: any = await Requisition.findAll({
                where: whereCondition,
                include: [
                    {
                        model: ExternalRequisitionService,
                        as: "external_services",
                    },
                    {
                        model: ExternalRequisitionServiceAttachment,
                        as: "external_service_attachments",
                    },
                ],
                order: [["created_at", "DESC"]],
            });
            const enrichedData = [];
            for (const req of requisitions) {
                const enriched = await resolveRequisitionRelations(req);
                const plainReq = req.toJSON
                    ? req.toJSON()
                    : req;

                enrichedData.push({
                    ...plainReq,
                    category: enriched.org_category,
                    branch: enriched.org_subsidiary_branch,
                });
            }
            return {
                success: true,
                statusCode: 200,
                message: "Requisition List fetched successfully",
                data: enrichedData || [],
            };
        }

        const currentPage = parseInt(page) || 1;
        const currentLimit = parseInt(limit) || 10;
        const offset = (currentPage - 1) * currentLimit;

        const { count: totalCount, rows: requisitionsData } =
            await Requisition.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: ExternalRequisitionService,
                        as: "external_services",
                    },
                    {
                        model: ExternalRequisitionServiceAttachment,
                        as: "external_service_attachments",
                    },
                ],
                limit: currentLimit,
                offset,
                order: [["created_at", "DESC"]],
            });
        const enrichedData = [];
        for (const req of requisitionsData) {
            const enriched = await resolveRequisitionRelations(req);
            const plainReq = req.toJSON ? req.toJSON() : req;

            enrichedData.push({
                ...plainReq,
                category: enriched.org_category,
                branch: enriched.org_subsidiary_branch,

            });
        }

        const totalPages = Math.ceil(totalCount / currentLimit);

        return {
            success: true,
            statusCode: 200,
            message: "Requisition List fetched successfully",
            data: {
                requisitions: enrichedData || [],
                pagination: {
                    currentPage,
                    totalPages,
                    totalCount,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1,
                },
            },
        };
    } catch (err: any) {
        console.log(err);
        return {
            success: false,
            statusCode: 500,
            message: "Internal Server Error",
            error: err.orginal.message,
        };
    }
};

// Get Product Detail
export const executeGetExternalServiceRequisition = async (
    id: string,
    organization_id: string
) => {
    const requisitionDetail = await Requisition.findOne({
        where: { id, organization_id },
        include: [
            {
                model: ExternalRequisitionService,
                as: "external_services",
                include: [
                    {
                        model: ExternalRequisitionServiceAttachment,
                        as: "attachments",
                    }
                ]
            }

        ],
    });
    if (!requisitionDetail) {
        return {
            success: false,
            statusCode: 404,
            message: "Requisition not found",
        };
    }
    const enriched = await resolveRequisitionRelations(requisitionDetail);

    return {
        success: true,
        statusCode: 200,
        message: "Requisition data retrieved successfully",
        data: enriched,
    };
};

export const executeDeleteExternalServiceRequisition = async (
    id: string,
    organization_id: string,
    transaction: Transaction
) => {
    const requisition = await Requisition.findOne({
        where: { id, organization_id },
        transaction,
    });
    if (!requisition) {
        return {
            success: false,
            statusCode: 404,
            message: "Requisition not found.",
        };
    }
    await requisition.destroy({ transaction });
    return {
        success: true,
        statusCode: 200,
        message: "Requisition deleted successfully.",
    };
};

// ====== Update Product
export const executeUpdateExternalServiceRequisition = async (
    requisitionId: string,
    payload: any,
    user: any,
    transaction: Transaction
) => {
    const { external_services, ...updatedPayload } = payload;

    const existingRequisition = await Requisition.findOne({
        where: {
            id: requisitionId,
            organization_id: user.organization_id,
            type: "external",
            request_type: "service",
        },
    });

    if (!existingRequisition) {
        return {
            success: false,
            statusCode: 404,
            message: "External service requisition not found.",
        };
    }
    if (!["pending", "in_revision"].includes(existingRequisition.status)) {
        return {
            success: false,
            statusCode: 400,
            message: "Cannot update requisition with current status.",
        };
    }

    await Requisition.update(
        {
            ...updatedPayload,
            last_action_by: user.id,
        },
        {
            where: { id: requisitionId },
            transaction,
        }
    );

    if (external_services !== undefined) {
        const payloadServiceIds = external_services
            .filter((service: any) => service.id)
            .map((service: any) => service.id);

        await ExternalRequisitionService.destroy({
            where: {
                requisition_id: requisitionId,
                ...(payloadServiceIds.length > 0 && {
                    id: { [Op.notIn]: payloadServiceIds },
                }),
            },
            transaction,
        });

        const servicePromises = external_services.map(async (service: any) => {
            const { attachments, ...serviceData } = service;
            const finalServiceData = {
                ...serviceData,
                requisition_id: requisitionId,
            };

            let processedService;
            if (service.id) {
                await ExternalRequisitionService.update(finalServiceData, {
                    where: {
                        id: service.id,
                        requisition_id: requisitionId,
                    },
                    transaction,
                });
                processedService = { ...finalServiceData, id: service.id };
            } else {
                const newService = await ExternalRequisitionService.create(
                    finalServiceData,
                    { transaction }
                );
                processedService = newService.toJSON();
            }

            if (attachments !== undefined) {
                const payloadAttachmentIds = attachments
                    .filter((attachment: any) => attachment.id)
                    .map((attachment: any) => attachment.id);

                await ExternalRequisitionServiceAttachment.destroy({
                    where: {
                        external_requisition_service_id: processedService.id,
                        ...(payloadAttachmentIds.length > 0 && {
                            id: { [Op.notIn]: payloadAttachmentIds },
                        }),
                    },
                    transaction,
                });

                const attachmentPromises = attachments.map(async (attachment: any) => {
                    const attachmentData = {
                        ...attachment,
                        external_requisition_service_id: processedService.id,
                    };

                    if (attachment.id) {
                        await ExternalRequisitionServiceAttachment.update(attachmentData, {
                            where: {
                                id: attachment.id,
                                external_requisition_service_id: processedService.id,
                            },
                            transaction,
                        });
                        return { ...attachmentData, id: attachment.id };
                    } else {
                        const newAttachment = await ExternalRequisitionServiceAttachment.create(
                            attachmentData,
                            { transaction }
                        );
                        return newAttachment.toJSON();
                    }
                });

                const processedAttachments = await Promise.all(attachmentPromises);
                processedService.attachments = processedAttachments;
            }

            return processedService;
        });

        await Promise.all(servicePromises);
    }


    return {
        success: true,
        statusCode: 200,
        message: "External service requisition updated successfully.",
    };
};

export const executeCreateInternalServiceRequisition = async (
    data: any,
    user: any,
    token: string,
    transaction: Transaction
) => {
    const organization_id = user?.organization_id;
    const created_by = user?.id;
    const request_id = await generateRequestId(user.organization_id, token);
    const { internal_services, type, request_type, ...updatedData } = data;
    try {
        const requisition = await Requisition.create(
            {
                ...updatedData,
                created_by,
                status: "pending",
                type: type || "internal",
                request_type: request_type || "service",
                organization_id,
                request_id
            },
            { transaction }
        );
        let internalServicesData = [];
        if (internal_services?.length > 0) {
            for (const ser of internal_services) {
                const { attachments, ...intServiceData } = ser;
                const createdItem = await InternalRequisitionService.create(
                    {
                        ...intServiceData,
                        requisition_id: requisition?.id
                    },
                    { transaction }
                );
                let attachmentsData = [];
                if (attachments?.length) {
                    for (const attachment of attachments) {
                        const newAttachment = await InternalRequisitionServiceAttachment.create(
                            {
                                internal_requisition_service_id: createdItem.id,
                                file_name: attachment.file_name,
                                file_url: attachment.file_url,
                            },
                            { transaction }
                        );
                        attachmentsData.push(newAttachment);
                    }
                }
                internalServicesData.push({
                    ...createdItem.toJSON(),
                    attachments: attachmentsData
                });
            }
        }

        return {
            success: true,
            statusCode: 201,
            message: "Internal Service Requisition created successfully.",
            data: {
                ...requisition.toJSON(),
                internal_services: internalServicesData
            },
        };
    } catch (err: any) {
        return {
            success: false,
            statusCode: 500,
            message: err.errors?.[0]?.message || err.message || "Failed to create external service requisition.",
            error: err?.message || String(err),
        };
    }
};


export const executeUpdateInternalServiceRequisition = async (
    requisitionId: string,
    payload: any,
    user: any,
    transaction: Transaction
) => {
    const { internal_services, ...updatedPayload } = payload;

    const existingRequisition = await Requisition.findOne({
        where: {
            id: requisitionId,
            organization_id: user.organization_id,
            type: "internal",
            request_type: "service",
        },
    });

    if (!existingRequisition) {
        return {
            success: false,
            statusCode: 404,
            message: "Internal service requisition not found.",
        };
    }
    if (!["pending", "in_revision"].includes(existingRequisition.status)) {
        return {
            success: false,
            statusCode: 400,
            message: "Cannot update requisition with current status.",
        };
    }

    await Requisition.update(
        {
            ...updatedPayload,
            last_action_by: user.id,
        },
        {
            where: { id: requisitionId },
            transaction,
        }
    );

    if (internal_services !== undefined) {
        const payloadServiceIds = internal_services
            .filter((service: any) => service.id)
            .map((service: any) => service.id);

        await InternalRequisitionService.destroy({
            where: {
                requisition_id: requisitionId,
                ...(payloadServiceIds.length > 0 && {
                    id: { [Op.notIn]: payloadServiceIds },
                }),
            },
            transaction,
        });

        const servicePromises = internal_services.map(async (service: any) => {
            const { attachments, ...serviceData } = service;
            const finalServiceData = {
                ...serviceData,
                requisition_id: requisitionId,
            };

            let processedService;
            if (service.id) {
                await InternalRequisitionService.update(finalServiceData, {
                    where: {
                        id: service.id,
                        requisition_id: requisitionId,
                    },
                    transaction,
                });
                processedService = { ...finalServiceData, id: service.id };
            } else {
                const newService = await InternalRequisitionService.create(
                    finalServiceData,
                    { transaction }
                );
                processedService = newService.toJSON();
            }

            if (attachments !== undefined) {
                const payloadAttachmentIds = attachments
                    .filter((attachment: any) => attachment.id)
                    .map((attachment: any) => attachment.id);

                await InternalRequisitionServiceAttachment.destroy({
                    where: {
                        internal_requisition_service_id: processedService.id,
                        ...(payloadAttachmentIds.length > 0 && {
                            id: { [Op.notIn]: payloadAttachmentIds },
                        }),
                    },
                    transaction,
                });

                const attachmentPromises = attachments.map(async (attachment: any) => {
                    const attachmentData = {
                        ...attachment,
                        internal_requisition_service_id: processedService.id,
                    };

                    if (attachment.id) {
                        await InternalRequisitionServiceAttachment.update(attachmentData, {
                            where: {
                                id: attachment.id,
                                internal_requisition_service_id: processedService.id,
                            },
                            transaction,
                        });
                        return { ...attachmentData, id: attachment.id };
                    } else {
                        const newAttachment = await InternalRequisitionServiceAttachment.create(
                            attachmentData,
                            { transaction }
                        );
                        return newAttachment.toJSON();
                    }
                });

                const processedAttachments = await Promise.all(attachmentPromises);
                processedService.attachments = processedAttachments;
            }

            return processedService;
        });

        await Promise.all(servicePromises);
    }

    return {
        success: true,
        statusCode: 200,
        message: "External service requisition updated successfully.",
    };
};

export const executeGetInternalServiceRequisition = async (
    id: string,
    organization_id: string
) => {
    const requisitionDetail = await Requisition.findOne({
        where: { id, organization_id },
        include: [
            {
                model: InternalRequisitionService,
                as: "internal_services",
                include: [
                    {
                        model: InternalRequisitionServiceAttachment,
                        as: "attachments",
                    },
                ]
            }

        ],
    });
    if (!requisitionDetail) {
        return {
            success: false,
            statusCode: 404,
            message: "Requisition not found",
        };
    }
    const enriched = await resolveRequisitionRelations(requisitionDetail);

    return {
        success: true,
        statusCode: 200,
        message: "Requisition data retrieved successfully",
        data: enriched,
    };
};
