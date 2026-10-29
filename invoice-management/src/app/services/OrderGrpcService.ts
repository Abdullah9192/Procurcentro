// src/utils/resolveBudgetRelations.ts

import {
    getBranchById,
    getDepartmentById,
    getUserById,
    getSubsidiaryById,
} from "../../grpc/clients/AdminGrpcClient";

export const resolvePurchaseOrderRelations = async (quotation: any) => {
    const [
        subsidiary,
        branch,
        department,
        createdBy,
    ] = await Promise.all([
        quotation.subsidiary_id ? getSubsidiaryById(quotation.subsidiary_id).catch(() => null) : null,
        quotation.subsidiary_branch_id ? getBranchById(quotation.subsidiary_branch_id).catch(() => null) : null,
        quotation.branch_department_id ? getDepartmentById(quotation.branch_department_id).catch(() => null) : null,
        quotation.created_by ? getUserById(quotation.created_by).catch(() => null) : null,
    ]);

    return {
        ...quotation,
        subsidiary,
        branch,
        department,
        requested_user: createdBy,
    };
};
