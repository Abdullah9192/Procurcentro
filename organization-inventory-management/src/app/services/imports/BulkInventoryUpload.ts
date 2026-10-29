import * as XLSX from "xlsx";
import fs from "fs";
import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";
import { executeAddProduct } from "../../respository/ProductRepository";
import AppDataSource from "../../../config/DatabaseSource";

export class ExcelItemServiceImporter {
    static async importItemsOrServices(
        filePath: string,
        type: "item" | "service",
        user: any,
        chunkSize = 100
    ) {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const orgId = user.organization_id;

        const results: any[] = [];
        let buffer: any[] = [];

        let totalRows = 0;
        let skippedRows = 0;
        let invalidRows: any[] = [];

        for (const row of rows.slice(1)) {
            totalRows++;

            if (type === "item") {
                const [
                    rowType,
                    subsidiary_name,
                    item_name,
                    item_description,
                    org_category_name,
                    org_sub_category_name,
                    brand_name,
                    sku,
                    estimated_stock_price,
                    estimated_shipping_price,
                    estimated_tax_price,
                    estimated_total_price,
                    stock_renewal_trigger,
                    low_inventory_notification,
                    length,
                    width,
                    height,
                    weight,
                    unit,
                    subsidiary_branch_name,
                    stock_quantity,
                ] = row;

                if (
                    !rowType ||
                    rowType.toString().trim().toLowerCase() !== "item" ||
                    !subsidiary_name ||
                    !item_name ||
                    !org_category_name
                ) {
                    skippedRows++;
                    invalidRows.push({
                        row,
                        message:
                            "Missing required fields (rowType, subsidiary_name, item_name, org_category_name)",
                    });
                    continue;
                }

                buffer.push({
                    type: "item",
                    subsidiary_name: subsidiary_name?.toString().trim(),
                    item_name: item_name?.toString().trim(),
                    item_description: item_description?.toString().trim(),
                    org_category_name: org_category_name?.toString().trim(),
                    org_sub_category_name: org_sub_category_name?.toString().trim(),
                    brand_name: brand_name?.toString().trim(),
                    sku: sku?.toString().trim(),
                    estimated_stock_price: Number(estimated_stock_price) || 0,
                    estimated_shipping_price: Number(estimated_shipping_price) || 0,
                    estimated_tax_price: Number(estimated_tax_price) || 0,
                    estimated_total_price: Number(estimated_total_price) || 0,
                    stock_renewal_trigger: Number(stock_renewal_trigger) || 0,
                    low_inventory_notification: Number(low_inventory_notification) || 0,
                    length: Number(length) || 0,
                    width: Number(width) || 0,
                    height: Number(height) || 0,
                    weight: Number(weight) || 0,
                    unit: unit?.toString().trim(),
                    subsidiary_branch_name: subsidiary_branch_name?.toString().trim(),
                    stock_quantity: Number(stock_quantity) || 0,
                });
            }

            if (type === "service") {
                const [
                    rowType,
                    subsidiary_name,
                    item_name,
                    item_description,
                    org_category_name,
                    org_sub_category_name,
                    brand_name,
                    estimated_stock_price,
                    estimated_tax_price,
                    estimated_total_price,
                ] = row;

                if (
                    !rowType ||
                    rowType.toString().trim().toLowerCase() !== "service" ||
                    !subsidiary_name ||
                    !item_name ||
                    !org_category_name
                ) {
                    skippedRows++;
                    invalidRows.push({
                        row,
                        message:
                            "Missing required fields (rowType, subsidiary_name, item_name, org_category_name)",
                    });
                    continue;
                }

                buffer.push({
                    type: "service",
                    subsidiary_name,
                    item_name,
                    item_description,
                    org_category_name,
                    org_sub_category_name,
                    brand_name,
                    estimated_stock_price,
                    estimated_tax_price,
                    estimated_total_price,
                });
            }

            if (buffer.length >= chunkSize) {
                const processed = await this.processChunk(buffer, orgId, user);

                results.push(...processed.valid_rows);

                // collect warnings / soft issues
                if (processed.invalid_rows?.length) {
                    invalidRows.push(...processed.invalid_rows);
                }

                // ❗ STOP immediately if hard error occurred inside processChunk
                if (processed.valid_rows.length === 0 && processed.invalid_rows?.length) {
                    return {
                        message: "Import failed due to validation errors",
                        valid_rows: results,
                        skipped_rows: invalidRows.length,
                        invalid_rows: invalidRows,
                    };
                }

                buffer = [];
            }
        }

        if (buffer.length > 0) {
            const processed = await this.processChunk(buffer, orgId, user);

            results.push(...processed.valid_rows);

            if (processed.invalid_rows?.length) {
                invalidRows.push(...processed.invalid_rows);
            }

            // ❗ STOP if hard validation failure occurred
            if (processed.valid_rows.length === 0 && processed.invalid_rows?.length) {
                return {
                    message: "Import failed due to validation errors",
                    valid_rows: results,
                    skipped_rows: invalidRows.length,
                    invalid_rows: invalidRows,
                };
            }
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (totalRows === 0) {
            return {
                message: "Excel file contains no data rows",
                valid_rows: [],
                invalid_rows: [],
            };
        }

        if (results.length === 0 && skippedRows === totalRows) {
            return {
                message:
                    "All rows were skipped. Please check required columns and rowType values.",
                valid_rows: [],
                invalid_rows: invalidRows,
            };
        }

        return {
            message: "Import processed",
            total_rows: totalRows,
            valid_rows: results,
            skipped_rows: skippedRows,
            invalid_rows: invalidRows,
        };
    }

    static async processChunk(chunk: any[], orgId: string, user: any): Promise<{
        valid_rows: any[];
        invalid_rows?: any[];
        warnings?: any[];
    }> {
        try {
            console.log("chunk buffer Data:", chunk, orgId);

            let response;

            // =========================
            // 1. CALL VALIDATION API
            // =========================
            try {
                response = await http.post(
                    `${service.ADMIN_SERVICE_URL}/v1/dashboard/validate-item-service-bulk`,
                    {
                        organization_id: orgId,
                        rows: chunk,
                    }
                );
            } catch (err: any) {
                console.error("Validation API HTTP error:", err?.response?.data || err.message);

                throw new Error(
                    err?.response?.data?.message || "Validation API failed"
                );
            }

            console.log("VALIDATION RESPONSE:", JSON.stringify(response.data, null, 2));

            const data = response?.data;

            if (!data) {
                throw new Error("Invalid validation response structure");
            }

            const validRows = data.valid_rows ?? [];
            const invalidRows = data.invalid_rows ?? [];

            console.log("VALID ROWS COUNT:", validRows.length);
            console.log("INVALID ROWS COUNT:", invalidRows.length);

            // =========================
            // 2. STOP IF VALIDATION FAILS
            // =========================
            // Detect HARD validation errors only
            const hardErrors = invalidRows.filter((r: any) =>
                r?.errors?.some((e: any) =>
                    typeof e === "string"
                        ? true
                        : ["required", "enum", "invalid"].includes(e?.type)
                )
            );

            // If HARD errors exist → STOP
            if (hardErrors.length > 0) {
                console.error("Hard validation errors:", hardErrors);

                throw new Error(
                    hardErrors
                        .map((r: any) =>
                            Array.isArray(r.errors)
                                ? r.errors.join(", ")
                                : JSON.stringify(r.errors)
                        )
                        .join(" | ")
                );
            }

            // Otherwise treat as warnings (non-blocking)
            const warnings = invalidRows;

            const savedRows: any[] = [];

            // =========================
            // 3. PROCESS VALID ROWS
            // =========================
            for (let i = 0; i < validRows.length; i++) {
                const ids = validRows[i];
                const originalRow = chunk[i];

                console.log(`\n--- Processing Row Index: ${i} ---`);
                console.log("Original Excel Row:", originalRow);
                console.log("Mapped IDs from validation:", ids);

                const transaction = await AppDataSource.transaction();

                try {
                    // =========================
                    // 4. BUILD PAYLOAD
                    // =========================
                    const payload: any = {
                        ...originalRow,

                        subsidiary_id: ids.subsidiary_id,
                        org_category_id: ids.org_category_id,
                        org_sub_category_id: ids.org_sub_category_id,
                        type: originalRow.type,

                        subsidiary_name: undefined,
                        org_category_name: undefined,
                        org_sub_category_name: undefined,
                        subsidiary_branch_name: undefined,
                    };

                    if (ids.subsidiary_branch_id) {
                        payload.locations = [
                            {
                                subsidiary_branch_id: ids.subsidiary_branch_id,
                                current_stock_quantity: originalRow.stock_quantity ?? 0,
                            },
                        ];
                    }

                    payload.total_stock = originalRow.stock_quantity ?? 0;

                    delete payload.stock_quantity;

                    console.log("FINAL PAYLOAD BEFORE DB:", JSON.stringify(payload, null, 2));

                    console.log(`
============================================================
🚨 ORGANIZATION DEBUG LOG
============================================================
Token Organization ID : ${user?.organization_id}
Payload Organization ID: ${orgId}
Mismatch Check         : ${user?.organization_id === orgId ? "MATCH" : "MISMATCH"}
============================================================
`);


                    // =========================
                    // 5. CALL PRODUCT CREATION
                    // =========================
                    console.log("Calling executeAddProduct...");

                    const result = await executeAddProduct(payload, user, transaction);

                    console.log("executeAddProduct RESULT:", result);

                    if (!result.success) {
                        console.log(`
============================================================
🚨 PRODUCT CREATION FAILED
============================================================
Reason: ${result.message}
============================================================
`);

                        await transaction.rollback();

                        invalidRows.push({
                            row_index: i + 1,
                            errors: [result.message],
                        });

                        continue;
                    }

                    // =========================
                    // 6. COMMIT
                    // =========================
                    console.log("Committing transaction...");
                    await transaction.commit();
                    console.log("Transaction committed successfully");

                    savedRows.push(result.data);

                } catch (err: any) {
                    console.log("Rolling back transaction due to error...");
                    await transaction.rollback();

                    console.error(`Row ${i} failed:`, err.message);

                    invalidRows.push({
                        row_index: i + 1,
                        errors: [err.message],
                    });

                    continue; // ✅ do NOT stop entire chunk
                }
            }

            // =========================
            // 7. SUCCESS RESPONSE
            // =========================
            return {
                valid_rows: savedRows,
                invalid_rows: invalidRows,
                warnings: warnings || [],
            };

        } catch (err: any) {
            console.error("Chunk-level error:", err.message);

            return {
                valid_rows: [],
                warnings: [],
                invalid_rows: [
                    {
                        row_index: null,
                        errors: [err.message],
                    },
                ],
            };
        }
    }

}