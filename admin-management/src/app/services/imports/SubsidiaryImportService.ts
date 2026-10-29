import * as XLSX from "xlsx";
import fs from "fs";
import Subsidiary from "../../models/Subsidiary";
import { Op } from "sequelize";

export class ExcelSubsidiaryImporter {
  static async importSubsidiaries(
    filePath: string,
    user: any,
    chunkSize = 100
  ): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let buffer: any[] = [];

    for (const row of rows.slice(1)) {
      const [subsidiary_name, email, address] = row;

      if (!subsidiary_name || !email || !address) continue;

      buffer.push({ subsidiary_name, email, address });

      if (buffer.length >= chunkSize) {
        await this.processChunk(buffer, user.organization_id, user.id);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      await this.processChunk(buffer, user.organization_id, user.id);
    }

    fs.unlinkSync(filePath);
  }

  static async processChunk(
    chunk: any[],
    organization_id: string,
    created_by: string
  ) {
    for (const item of chunk) {
      const existing = await Subsidiary.findOne({
        where: {
          organization_id,
          subsidiary_name: { [Op.iLike]: item.subsidiary_name },
        },
      });

      if (existing) {
        console.warn(`Duplicate: ${item.subsidiary_name}`);
        continue;
      }

      await Subsidiary.create({
        subsidiary_name: item.subsidiary_name,
        email: item.email,
        address: item.address,
        organization_id,
      });
    }
  }
}
