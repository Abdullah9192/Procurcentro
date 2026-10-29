import { Request, Response } from "express";
import AppDataSource from "../../../../config/DatabaseSource";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";
import { getCatalogueByIdValidation, getCatalogueListValidation, supplierCatalogueUpdateValidation, supplierCatalogueValidation, updateSupplierCatalogueLocationsValidation } from "../../validators/CatalogueValidation";
import { executeBulkUploadSupplierCatalogue, executeCreateSupplierCatalogue, executeDeleteCatalogue, executeGetAllCatalogues, executeGetCatalogueById, executeUpdateSupplierCatalogue, executeUpdateSupplierCatalogueLocations } from "../../../respository/catalogue/CatalogueRepository";

// ======= Add Catalogue :
export const createCatalogue = async (req: Request, res: Response): Promise<void> => {
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

    const { error } = supplierCatalogueValidation.validate(req.body);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeCreateSupplierCatalogue(req.body, user, transaction);

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
            message: "Failed to create supplier catalogue.",
            error: err,
        });
    }
};

export const bulkUploadCatalogue = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;

    if (!user?.id || !user?.organization_id) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
    }

    const file = (req as any).file;

    if (!file) {
        errorResponse(res, {
            message: "Excel file is required",
            statusCode: 400,
        });
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeBulkUploadSupplierCatalogue(
            file.path,
            user,
            transaction
        );

        await transaction.commit();

        successResponse(res, {
            statusCode: 200,
            message: "Bulk upload processed",
            data: result,
        });
    } catch (err) {
        await transaction.rollback();

        errorResponse(res, {
            statusCode: 500,
            message: "Bulk upload failed",
            error: err,
        });
    }
};

// =======Update Catalogue :
export const updateSupplierCatalogueLocations = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;

    if (!user?.id || !user?.organization_id) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }

    const { error, value } =
        updateSupplierCatalogueLocationsValidation.validate(req.body);

    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeUpdateSupplierCatalogueLocations(
            req.params.id,
            value.locations,
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
            statusCode: 200,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        await transaction.rollback();

        errorResponse(res, {
            statusCode: 500,
            message: "Failed to update locations",
            error,
        });
    }
};

export const updateCatalogue = async (req: Request, res: Response): Promise<void> => {
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
    if (!req.params.supplier_catalogue_id) {
        errorResponse(res, {
            message: "Catalogue Id isn't provided",
            statusCode: 401,
        });
        return;
    }

    const requestData = {
        organization_id: user?.organization_id,
        supplier_catalogue_id: req.params.supplier_catalogue_id,
        ...req.body
    };

    const { error } = supplierCatalogueUpdateValidation.validate(requestData);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeUpdateSupplierCatalogue(requestData, user, transaction);

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
            message: "Failed to Update catalogue.",
            error: err,
        });
    }
};

// =======Get Catalogue by id :
export const getCatalogueById = async (req: Request, res: Response): Promise<void> => {
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

    if (!req.params.supplier_catalogue_id) {
        errorResponse(res, {
            message: "Catalogue ID is required",
            statusCode: 400,
        });
        return;
    }

    const requestData = {
        organization_id: user?.organization_id,
        supplier_catalogue_id: req.params.supplier_catalogue_id,
    };

    const { error } = getCatalogueByIdValidation.validate(requestData);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    try {
        const result = await executeGetCatalogueById(req.params.supplier_catalogue_id, user);

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
            message: "Failed to retrieve catalogue.",
            error: err,
        });
    }
};

// ======= Get All Catalogues with Pagination
export const getAllCatalogues = async (req: Request, res: Response): Promise<void> => {
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
        organization_id: req.query.organization_id ? req.query.organization_id : user?.organization_id,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search ? (req.query.search as string) : undefined,
        type: req.query.type ? (req.query.type as string) : undefined,
        is_active: req.query.is_active ? (req.query.is_active as string) === 'true' : undefined,
        item_name: req.query.item_name ? (req.query.item_name as string) : undefined,
        supplier_category_id: req.query.supplier_category_id ? (req.query.supplier_category_id as string) : undefined,
        min_price: req.query.min_price ? Number(req.query.min_price) : undefined,
        max_price: req.query.max_price ? Number(req.query.max_price) : undefined,
        restock_from_date: req.query.restock_from_date ? (req.query.restock_from_date as string) : undefined,
        restock_to_date: req.query.restock_to_date ? (req.query.restock_to_date as string) : undefined,
    };

    const { error } = getCatalogueListValidation.validate(requestData);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    try {
        const result = await executeGetAllCatalogues(requestData);

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
            message: "Failed to retrieve catalogues.",
            error: err,
        });
    }
};

// ======= Delete Catalogue
export const deleteCatalogue = async (req: Request, res: Response): Promise<void> => {
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

    if (!req.params.supplier_catalogue_id) {
        errorResponse(res, {
            message: "Catalogue ID is required",
            statusCode: 400,
        });
        return;
    }

    const requestData = {
        organization_id: user?.organization_id,
        supplier_catalogue_id: req.params.supplier_catalogue_id,
    };

    const { error } = getCatalogueByIdValidation.validate(requestData);
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeDeleteCatalogue(req.params.supplier_catalogue_id, user, transaction);

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
        });

    } catch (err) {
        await transaction.rollback();
        errorResponse(res, {
            statusCode: 500,
            message: "Failed to delete catalogue.",
            error: err,
        });
    }
};