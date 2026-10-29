import { Request, Response } from "express";
// import fs from "fs";
import { errorResponse, successResponse } from "../../utils/general/ResponseUtils";
import { addBulkOrgInventoryValidation, addOrgInventoryValidation, moveOrgInventoryLocationValidation, moveOrgInventoryLocationValidations, updateOrgInventoryValidation } from "../validators/InventoryValidation";
import AppDataSource from "../../../config/DatabaseSource";
import { executeAddBulkProducts, executeAddProduct, executeDeactivateProduct, executeDeleteProduct, executeGetOrgCategories, executeGetProduct, executeGetProducts, executeUpdateInventoryLocation, executeUpdateProduct } from "../../respository/ProductRepository";
import { ExcelItemServiceImporter } from "../../services/imports/BulkInventoryUpload";

// ======= Add Inventory :
export const addProduct = async (req: Request, res: Response): Promise<void> => {

    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "user authentication required",
            statusCode: 401,
        });
        return;
    }
    const payload = req.body;

    const { error, value } = addOrgInventoryValidation.validate(payload, { convert: true });
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeAddProduct(value, user, transaction);
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
            message: error?.message || "Failed to create Organization Inventory.",
        });
    }
};

// ======= Add Bulk Inventory :
export const addBulkProducts = async (
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

    const payload = req.body;

    const { error, value } = addBulkOrgInventoryValidation.validate(payload, {
        convert: true,
    });

    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeAddBulkProducts(value, user, transaction);

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
            message: error?.message || "Failed to create Organization Inventory.",
        });
    }
};

export const serviceItemInventoryBulkUpload = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;
    const { type } = req.body;

    if (!user?.id || !user?.organization_id) {
        errorResponse(res, {
            statusCode: 401,
            message: "User authentication required",
        });
        return;
    }

    if (!req.file) {
        errorResponse(res, {
            statusCode: 400,
            message: "No file provided.",
        });
        return;
    }

    if (!type || !["item", "service"].includes(type)) {
        errorResponse(res, {
            statusCode: 400,
            message: "Invalid type, must be 'item' or 'service'",
        });
        return;
    }

    try {
        const result = await ExcelItemServiceImporter.importItemsOrServices(
            req.file.path,
            type,
            user
        );

        // ✅ IMPORTANT: check failures
        if (result.invalid_rows?.length > 0) {

            // ❌ CASE 1: NOTHING VALID → FAIL
            if (!result.valid_rows || result.valid_rows.length === 0) {

                const errorMessages = result.invalid_rows
                    .flatMap((r: any) => r.errors || r.message || [])
                    .filter((e: any) => e && e.toString().trim() !== "");

                errorResponse(res, {
                    statusCode: 422,
                    message: result.message || "Import failed. Invalid file format or data.",
                    error: errorMessages.join(" | "),
                });

                return;
            }

            // 🔍 EXISTING HARD ERROR CHECK
            const hasHardError = result.invalid_rows.some((row: any) =>
                row.errors?.some((err: string) =>
                    err.toLowerCase().includes("duplicate") ||
                    err.toLowerCase().includes("failed") ||
                    err.toLowerCase().includes("invalid") ||
                    err.toLowerCase().includes("required")
                )
            );

            // ❌ HARD ERROR → FAIL
            if (hasHardError) {
                const errorMessages = result.invalid_rows
                    .flatMap((r: any) => r.errors || [])
                    .filter((e: any) => e && e.toString().trim() !== "");

                errorResponse(res, {
                    statusCode: 422,
                    message: "Import failed due to validation errors.",
                    error: errorMessages.join(" | "),
                });

                return;
            }

            // ⚠️ SOFT WARNING → SUCCESS
            successResponse(res, {
                statusCode: 200,
                message: "Import completed with warnings.",
                data: result,
            });

            return;
        }

        successResponse(res, {
            statusCode: 200,
            message: "Import completed successfully.",
            data: result,
        });

    } catch (err: any) {
        errorResponse(res, {
            statusCode: 500,
            message: err.message || "Failed to upload Import.",
            error: err,
        });
    }
};

// export class ExcelImportController {
//     static importItemsOrServices: RequestHandler = async (req: Request, res: Response) => {
//         try {
//             const { type } = req.body;
//             const file = req.file;
//             const user = req.user;

//             if (!user || !user.organization_id) {
//                 return res
//                     .status(401)
//                     .json({ message: "Unauthorized: user not found or invalid token" });
//             }

//             if (!file) {
//                 return res.status(400).json({ message: "No file uploaded" });
//             }

//             if (!type || !["item", "service"].includes(type)) {
//                 return res
//                     .status(400)
//                     .json({ message: "Invalid type, must be 'item' or 'service'" });
//             }

//             const filePath = file.path;

//             try {
//                 const result =
//                     await ExcelItemServiceImporter.importItemsOrServices(
//                         filePath,
//                         type,
//                         user
//                     );

//                 return res.status(200).json({
//                     message: "Import completed",
//                     data: result,
//                 });
//             } finally {
//                 if (filePath && fs.existsSync(filePath)) {
//                     fs.unlinkSync(filePath);
//                 }
//             }
//         } catch (err) {
//             console.error("Error importing Excel:", err);
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     };
// }

// ===== get Inventories list

export const getProducts = async (req: Request, res: Response) => {
    const user = (req as any).user;

    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }
    const requestData = {
        organization_id: user?.organization_id,
        subsidiary_id: req.query.subsidiary_id ? req.query.subsidiary_id : undefined,
        branch_id: req.query.branch_id || undefined,
        department_id: req.query.department_id || undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search ? req.query.search as string : undefined,
        is_active:
            req.query.is_active === "1" ? true :
                req.query.is_active === "0" ? false :
                    undefined,
        type: req.query.type || undefined, // item | service
        min_stock: req.query.min_stock ? Number(req.query.min_stock) : undefined,
        max_stock: req.query.max_stock ? Number(req.query.max_stock) : undefined,
        category: req.query.category || undefined, // category_name
    };

    try {
        const result = await executeGetProducts(requestData);
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
            message: res.statusMessage || "Failed to fetch the Organization Inventory List",
        });
    }
};

// ====== get Inventory Detail:
export const getProduct = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;

    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }
    const { id } = req.params;
    try {
        const result = await executeGetProduct(id, user?.organization_id);
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
            message: "Failed to get Inventory detail.",
            error: err,
        });
    }
};

// ===== Delete Inventory:
export const deleteProduct = async (
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
    const { id } = req.params;
    const transaction = await AppDataSource.transaction();
    try {
        const result = await executeDeleteProduct(id, user?.organization_id, transaction);
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
            message: "Failed to delete inventory.",
            error: err,
        });
    }
};

// ==== Deactivate / Activate Inventory
export const deactivateProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            statusCode: 401,
            message: "User authentication required",
            error: "unauthorized",
        });
        return;
    }
    const { id } = req.params;
    const transaction = await AppDataSource.transaction();
    try {
        const result = await executeDeactivateProduct(id, user, transaction);
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
            message: "Failed to deactivate/activate inventory.",
            error: err,
        });
    }
};

// =========== update Product :
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "user authentication required",
            statusCode: 401,
        });
        return;
    }

    const { id } = req.params;
    const payload = req.body;

    if (!id) {
        errorResponse(res, {
            statusCode: 400,
            message: "Product ID is required",
        });
        return;
    }

    const { error, value } = updateOrgInventoryValidation.validate(payload, { convert: true });
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeUpdateProduct(id, value, user, transaction);
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
            message: error?.message || "Failed to update Organization Inventory.",
        });
    }
};
console.log('update location update');


// =========== Move Inventory Location :
// export const updateInventoryLocation = async (req: Request, res: Response): Promise<void> => {
//     const user = (req as any).user;
//     if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
//         errorResponse(res, {
//             message: "user authentication required",
//             statusCode: 401,
//         });
//         return;
//     }

//     const { id } = req.params;
//     const payload = req.body;

//     if (!id) {
//         errorResponse(res, {
//             statusCode: 400,
//             message: "Location ID is required",
//         });
//         return;
//     }

//     const { error, value } = moveOrgInventoryLocationValidation.validate(payload, { convert: true });
//     if (error) {
//         errorResponse(res, {
//             statusCode: 400,
//             message: error.details[0].message,
//         });
//         return;
//     }

//     const transaction = await AppDataSource.transaction();

//     try {
//         const result = await executeUpdateInventoryLocation(id, value, user, transaction);
//         if (!result.success) {
//             await transaction.rollback();
//             errorResponse(res, {
//                 statusCode: result.statusCode,
//                 message: result.message,
//             });
//             return;
//         }
//         await transaction.commit();
//         successResponse(res, {
//             statusCode: result.statusCode,
//             message: result.message,
//         });
//     } catch (error: any) {
//         await transaction.rollback();
//         errorResponse(res, {
//             statusCode: 500,
//             message: error?.message || "Failed to update Inventory Location.",
//         });
//     }
// };

export const updateInventoryLocation = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;

    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "user authentication required",
            statusCode: 401,
        });
        return;
    }

    const payload = req.body;

    const { error, value } = moveOrgInventoryLocationValidations.validate(payload, { convert: true });
    if (error) {
        errorResponse(res, {
            statusCode: 400,
            message: error.details[0].message,
        });
        return;
    }

    const transaction = await AppDataSource.transaction();

    try {
        const result = await executeUpdateInventoryLocation(value, transaction);

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

    } catch (error: any) {
        await transaction.rollback();
        errorResponse(res, {
            statusCode: 500,
            message: error?.message || "Failed to update Inventory Location.",
        });
    }
};

// get category against organization
export const getOrgCategories = async (req: Request, res: Response) => {
    const user = (req as any).user;

    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
        errorResponse(res, {
            message: "User authentication required",
            statusCode: 401,
        });
        return;
    }

    try {
        const requestData = {
            organization_id: user.organization_id,
        };

        const result = await executeGetOrgCategories(requestData);

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
            message: res.statusMessage || "Failed to fetch Organization Categories",
        });
    }
};