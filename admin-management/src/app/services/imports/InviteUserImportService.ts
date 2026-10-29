import * as XLSX from "xlsx";
import fs from "fs";
import  User  from "../../models/User";
import  Subsidiary from "../../models/Subsidiary";
import  SubsidiaryBranch from "../../models/SubsidiaryBranch";
import  BranchDepartment from "../../models/BranchDepartment";
import  OrgRole from "../../models/OrgRole";

export class ExcelInviteUserImporter {
  static async importInviteUsers(filePath: string, user: any, chunkSize = 100) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    const orgId = user.organization_id;
    const allAddedUsers: any[] = [];
    let buffer: any[] = [];

    for (const row of rows.slice(1)) {
      const [
        name,
        email,
        subsidiary_name,
        branch_department_name,
        subsidiary_branch_name,
        org_role_name,
        is_head_department,
      ] = row;

      if (
        !name ||
        !email ||
        !subsidiary_name ||
        !branch_department_name ||
        !subsidiary_branch_name ||
        !org_role_name
      ) {
        continue;
      }

      buffer.push({
        name,
        email,
        subsidiary_name,
        branch_department_name,
        subsidiary_branch_name,
        org_role_name,
        is_head_department: is_head_department?.toString().toLowerCase() === "true",
      });

      if (buffer.length >= chunkSize) {
        const users = await this.processChunk(buffer, orgId, user.id);
        allAddedUsers.push(...users);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      const users = await this.processChunk(buffer, orgId, user.id);
      allAddedUsers.push(...users);
    }

    fs.unlinkSync(filePath);
    return allAddedUsers;
  }

  static async processChunk(chunk: any[], orgId: string, createdBy: string) {
    const addedUsers: any[] = [];

    for (const item of chunk) {
      const [subsidiary, branch, department, role] = await Promise.all([
        Subsidiary.findOne({ where: { subsidiary_name: item.subsidiary_name, organization_id: orgId } }),
        SubsidiaryBranch.findOne({ where: { branch_name: item.subsidiary_branch_name, organization_id: orgId } }),
        BranchDepartment.findOne({ where: { department_name: item.branch_department_name, organization_id: orgId } }),
        OrgRole.findOne({ where: { role_name: item.org_role_name, organization_id: orgId } }),
      ]);

      if (!subsidiary || !branch || !department || !role) {
        console.warn(`Missing entity: ${item.name}`);
        continue;
      }

      const alreadyExists = await User.findOne({
        where: { email: item.email, organization_id: orgId },
      });

      if (alreadyExists) {
        console.warn(`Duplicate email: ${item.email}`);
        continue;
      }

      addedUsers.push({
        name: item.name,
        email: item.email,
        organization_id: orgId,
        user_type: "employee",
        is_active: true,
        is_email_verified: false,
        is_owner: false,
        subsidiary_id: subsidiary.id,
        subsidiary_branch_id: branch.id,
        branch_department_id: department.id,
        org_role_id: role.id,
        is_head_department: item.is_head_department,
        created_by: createdBy,
      });
    }

    if (addedUsers.length > 0) {
      await User.bulkCreate(addedUsers);
    }

    return addedUsers;
  }
}
