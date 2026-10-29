import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert('modules', [
      { name: "User Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Quotations Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Approvals Workflow", createdAt: new Date(), updatedAt: new Date() },
      { name: "Invoices", createdAt: new Date(), updatedAt: new Date() },
      { name: "Vendor Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Inventory Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Reports and Analytics", createdAt: new Date(), updatedAt: new Date() },
      { name: "System Settings", createdAt: new Date(), updatedAt: new Date() },
      { name: "Audit Logs", createdAt: new Date(), updatedAt: new Date() },
      { name: "Integrations Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Compliance and Security Settings", createdAt: new Date(), updatedAt: new Date() },
      { name: "Requisitions Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Purchase Orders (POs)", createdAt: new Date(), updatedAt: new Date() },
      { name: "Receiving Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Budget Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Contracts", createdAt: new Date(), updatedAt: new Date() },
      { name: "Claims and Returns", createdAt: new Date(), updatedAt: new Date() },
      { name: "Catalog Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Subscription Management", createdAt: new Date(), updatedAt: new Date() },
      { name: "Platform Branding", createdAt: new Date(), updatedAt: new Date() },
      { name: "Data Backup and Recovery", createdAt: new Date(), updatedAt: new Date() },
      { name: "Notification Management", createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('modules', {
      name: [
        "User Management",
        "Quotations Management",
        "Approvals Workflow",
        "Invoices",
        "Vendor Management",
        "Inventory Management",
        "Reports and Analytics",
        "System Settings",
        "Audit Logs",
        "Integrations Management",
        "Compliance and Security Settings",
        "Requisitions Management",
        "Purchase Orders (POs)",
        "Receiving Management",
        "Budget Management",
        "Contracts",
        "Claims and Returns",
        "Catalog Management",
        "Subscription Management",
        "Platform Branding",
        "Data Backup and Recovery",
        "Notification Management"
      ]
    });
  }
};