// org-role-module-permissions-seeder.ts
import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {

    await queryInterface.bulkDelete("org_role_module_permissions", {});

    const roles: any[] = await queryInterface.sequelize.query(
      `SELECT id, role_name FROM org_roles`,
      { type: QueryTypes.SELECT }
    );

    const modules: any[] = await queryInterface.sequelize.query(
      `SELECT id, name FROM modules`,
      { type: QueryTypes.SELECT }
    );

    const organizations: any[] = await queryInterface.sequelize.query(
      `SELECT id FROM organizations`,
      { type: QueryTypes.SELECT }
    );

    const roleMap: Record<string, string> = {};
    const moduleMap: Record<string, string> = {};

    roles.forEach(r => roleMap[r.role_name] = r.id);
    modules.forEach(m => moduleMap[m.name] = m.id);

    const rolePermissions: Record<string, string[]> = {

      Requestor: [
        "Requisition",
        "Quotations",
        "Receiving",
        "Reports",
        "System Settings"
      ],

      "Procurement Manager": [
        "Requisition",
        "Quotations",
        "Receiving",
        "Approvals",
        "Purchase Order",
        "Vendor Management",
        "Inventory",
        "Contract Management",
        "Reports",
        "System Settings"
      ],

      Finance: [
        "Purchase Order",
        "Invoice",
        "Budget",
        "Reports",
        "System Settings"
      ],

      Approver: [
        "Approvals",
        "Reports",
        "System Settings"
      ],

      Legal: [
        "Quotations",
        "Contract Management",
        "Approvals",
        "Reports",
        "System Settings"
      ]

    };

    const permissions: any[] = [];

    organizations.forEach(org => {

      Object.entries(rolePermissions).forEach(([roleName, modulesList]) => {

        const roleId = roleMap[roleName];

        modulesList.forEach(moduleName => {

          const moduleId = moduleMap[moduleName];

          if (roleId && moduleId) {
            permissions.push({
              id: uuidv4(),
              org_role_id: roleId,
              module_id: moduleId,
              organization_id: org.id,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }

        });

      });

    });

    await queryInterface.bulkInsert(
      "org_role_module_permissions",
      permissions
    );
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete(
      "org_role_module_permissions",
      {},
      {}
    );
  }
};