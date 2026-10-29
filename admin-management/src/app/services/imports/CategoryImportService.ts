import * as XLSX from "xlsx";
import fs from "fs";
import OrgCategory from "../../models/OrgCategory";
import { Op } from "sequelize";

export class ExcelCategoryImporter {
  static async importCategories(
    filePath: string,
    user: { organization_id: string; id: string },
    chunkSize = 100
  ): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let buffer: any[] = [];

    for (const row of rows.slice(1)) {
      const [category_name] = row;

      if (!category_name) continue;

      buffer.push({ category_name });

      if (buffer.length >= chunkSize) {
        await this.processChunk(buffer, user.organization_id);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      await this.processChunk(buffer, user.organization_id);
    }

    fs.unlinkSync(filePath);
  }

  static async processChunk(chunk: any[], organization_id: string): Promise<void> {
    for (const item of chunk) {
      const exists = await OrgCategory.findOne({
        where: {
          organization_id,
          category_name: { [Op.iLike]: item.category_name },
        },
      });

      if (exists) {
        console.warn(`Duplicate category: ${item.category_name}`);
        continue;
      }

      await OrgCategory.create({
        category_name: item.category_name,
        organization_id,
      });
    }
  }
}
