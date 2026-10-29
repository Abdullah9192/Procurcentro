import * as XLSX from "xlsx";
import fs from "fs";
import OrgCategory from "../../models/OrgCategory";
import OrgCategoryService from "../../models/OrgCategoryService";

export class ExcelCategoryServiceImporter {
    static async importCategoryServices(filePath: string, user: any, chunkSize = 100): Promise<any[]> {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        let buffer: any[] = [];
        let allAddedServices: any[] = [];

        for (const row of rows.slice(1)) {
            const [name, description, org_category_name] = row;

            if (!name || !description || !org_category_name) {
                continue;
            }

            buffer.push({
                name,
                description,
                org_category_name,
            });

            if (buffer.length >= chunkSize) {
                const added = await this.processChunk(buffer, user);
                allAddedServices.push(...added);
                buffer = [];
            }
        }

        if (buffer.length > 0) {
            const added = await this.processChunk(buffer, user);
            allAddedServices.push(...added);
        }

        fs.unlinkSync(filePath);
        return allAddedServices;
    }

    static async processChunk(chunk: any[], user: any): Promise<any[]> {
        const addedServices: any[] = [];

        for (const item of chunk) {
            const category = await OrgCategory.findOne({
                where: {
                    category_name: item.org_category_name,
                    organization_id: user.organization_id,
                },
            });

            if (!category) continue;

            const existing = await OrgCategoryService.findOne({
                where: {
                    name: item.name,
                    org_category_id: category.id,
                    organization_id: user.organization_id,
                },
            });

            if (existing) continue;

            const newService = await OrgCategoryService.create({
                name: item.name,
                description: item.description,
                org_category_id: category.id,
                organization_id: user.organization_id,
            });

            addedServices.push(newService);
        }

        return addedServices;
    }
}
