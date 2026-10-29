import Subsidiary from "../models/Subsidiary";
import OrgCategory from "../models/OrgCategory";
import OrgSubCategory from "../models/OrgSubCategory";
import BranchDepartment from "../models/BranchDepartment";

interface ValidationRow {
    type: "item" | "service";
    subsidiary_name: string;
    item_name: string;
    item_description?: string;
    org_category_name: string;
    org_sub_category_name?: string;
    branch_name?: string;
    brand_name?: string;
    sku?: string;
    stock_quantity?: number;
    [key: string]: any;
}

export class ValidationService {
    static async validateBulkRows(
        organization_id: string,
        rows: ValidationRow[]
    ) {
        const validRows: any[] = [];
        const invalidRows: any[] = [];

        // Preload all relevant data once per org to avoid multiple DB queries
        const [subsidiaries, categories, subCategories, branches] =
            await Promise.all([
                Subsidiary.findAll({ where: { organization_id, is_active: true } }),
                OrgCategory.findAll({ where: { organization_id, is_active: true } }),
                OrgSubCategory.findAll({ where: { organization_id, is_active: true } }),
                BranchDepartment.findAll({ where: { organization_id, is_active: true } }),
            ]);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const errors: string[] = [];

            console.log(`Processing row ${i + 1}:`, row);

            const subsidiary = subsidiaries.find(s => s.subsidiary_name?.trim().toLowerCase() === row.subsidiary_name?.trim().toLowerCase());
            if (!subsidiary) errors.push("Subsidiary not found");

            const category = categories.find(c => c.category_name?.trim().toLowerCase() === row.org_category_name?.trim().toLowerCase());
            if (!category) errors.push("Org category not found");

            let subCategory;
            if (row.org_sub_category_name) {
                subCategory = subCategories.find(
                    sc => sc.name === row.org_sub_category_name && sc.org_category_id === category?.id
                );
                if (!subCategory) errors.push("Org sub-category not found");
            }

            let branch;
            if (row.branch_name) {
                branch = branches.find(
                    b => b.subsidiary_branch_id === row.branch_name || b.department_name === row.branch_name
                );
                if (!branch) errors.push("Branch not found");
            }

            if (errors.length > 0) {
                console.log(`Row ${i + 1} invalid:`, errors);
                invalidRows.push({ row_index: i + 1, errors });
                continue;
            }

            if (!subsidiary || !category) {
                invalidRows.push({ row_index: i + 1, errors });
                continue;
            }

            console.log(`Row ${i + 1} valid, mapped IDs:`, {
                subsidiary_id: subsidiary.id,
                org_category_id: category.id,
                org_sub_category_id: subCategory?.id || null,
                branch_id: branch?.id || null,
            });

            // Map names to IDs
            const mappedRow: any = {
                ...row,
                subsidiary_id: subsidiary.id,
                org_category_id: category.id,
                org_sub_category_id: subCategory?.id || null,
                subsidiary_branch_id: branch?.id || null,
            };

            // Remove name fields
            // delete mappedRow.subsidiary_name;
            // delete mappedRow.org_category_name;
            // delete mappedRow.org_sub_category_name;
            // delete mappedRow.branch_name;

            validRows.push(mappedRow);
        }

        return { valid_rows: validRows, invalid_rows: invalidRows };
    }
}