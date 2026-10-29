import * as XLSX from "xlsx";
import fs from "fs";
import  Organization  from "../../models/Organization";
import OrgCategory  from "../../models/OrgCategory";
import OrgSubCategory  from "../../models/OrgSubCategory";

export class ExcelSubCategoryImporter {
  static async importSubCategories(filePath: string, user: any, chunkSize = 100): Promise<any[]> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let buffer: any[] = [];
    let allAddedCategoryItems: any[] = [];

    for (const row of rows.slice(1)) {
      const [sub_category_name, org_category_name] = row;

      if (!sub_category_name || !org_category_name) {
        continue;
      }

      buffer.push({
        sub_category_name,
        org_category_name,
      });

      if (buffer.length >= chunkSize) {
        const added = await this.processChunk(buffer, user);
        allAddedCategoryItems.push(...added);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      const added = await this.processChunk(buffer, user);
      allAddedCategoryItems.push(...added);
    }

    fs.unlinkSync(filePath); // delete file
    return allAddedCategoryItems;
  }

  static async processChunk(chunk: any[], user: any): Promise<any[]> {
    const addedItems: any[] = [];

    for (const item of chunk) {
      const organization = await Organization.findByPk(user.organization_id);
      if (!organization) continue;

      const category = await OrgCategory.findOne({
        where: {
          category_name: item.org_category_name,
          organization_id: organization.id,
        },
      });

      if (!category) continue;

      const existing = await OrgSubCategory.findOne({
        where: {
          name: item.sub_category_name,
          organization_id: organization.id,
          org_category_id: category.id,
        },
      });

      if (existing) continue;

      const newItem = await OrgSubCategory.create({
        name: item.sub_category_name,
        org_category_id: category.id,
        organization_id: organization.id,
      });
      addedItems.push(newItem);
    }

    return addedItems;
  }
}
