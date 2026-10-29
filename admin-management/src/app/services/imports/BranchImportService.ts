import * as XLSX from "xlsx";
import fs from "fs";
import Subsidiary from "../../models/Subsidiary";
import SubsidiaryBranch from "../../models/SubsidiaryBranch";
import { Op } from "sequelize";

export class ExcelBranchImporter {
  static async importBranches(
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
      const [branch_name, address,subsidiary_name] = row;

      if (!branch_name || !address || !subsidiary_name) continue;

      buffer.push({
        branch_name,
        address,
        subsidiary_name,
      });

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
      const subsidiary = await Subsidiary.findOne({
        where: {
          organization_id,
          subsidiary_name: { [Op.iLike]: item.subsidiary_name },
        },
      });

      if (!subsidiary) {
        console.warn(`Subsidiary not found: ${item.subsidiary_name}`);
        continue;
      }

      const exists = await SubsidiaryBranch.findOne({
        where: {
          subsidiary_id: subsidiary.id,
          branch_name: { [Op.iLike]: item.branch_name },
        },
      });

      if (exists) {
        console.warn(`Duplicate branch: ${item.branch_name}`);
        continue;
      }

      await SubsidiaryBranch.create({
        branch_name: item.branch_name,
        address: item.address,
        subsidiary_id: subsidiary.id,
        organization_id: organization_id,
      });
    }
  }
}
