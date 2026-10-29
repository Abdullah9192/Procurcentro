import * as XLSX from "xlsx";
import fs from "fs";
import Subsidiary from "../../models/Subsidiary";
import SubsidiaryBranch from "../../models/SubsidiaryBranch";
import BranchDepartment from "../../models/BranchDepartment";
import { Op } from "sequelize";

export class ExcelDepartmentImporter {
  static async importDepartments(
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
      const [department_name, subsidiary_name, branch_name] = row;

      if (!department_name || !subsidiary_name || !branch_name) continue;

      buffer.push({ department_name, subsidiary_name, branch_name });

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
      const branch = await SubsidiaryBranch.findOne({
        where: {
          subsidiary_id: subsidiary.id,
          branch_name: { [Op.iLike]: item.branch_name },
        },
      });
      if (!branch) {
        console.warn(`Branch not found: ${item.branch_name}`);
        continue;
      }
      const existing = await BranchDepartment.findOne({
        where: {
          department_name: { [Op.iLike]: item.department_name },
          subsidiary_id: subsidiary.id,
          subsidiary_branch_id: branch.id,
          organization_id,
        },
      });

      if (existing) {
        console.warn(`Duplicate department: ${item.department_name}`);
        continue;
      }

      await BranchDepartment.create({
        department_name: item.department_name,
        subsidiary_id: subsidiary.id,
        subsidiary_branch_id: branch.id,
        organization_id,
      });
    }
  }
}
