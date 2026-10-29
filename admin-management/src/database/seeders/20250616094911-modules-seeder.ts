import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert('modules', [
      { id: uuidv4(), name: "User Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Quotations Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Approvals Workflow", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Invoices", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Vendor Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Inventory Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Reports and Analytics", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "System Settings", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Audit Logs", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Integrations Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Compliance and Security Settings", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Requisitions Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Purchase Orders (POs)", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Receiving Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Budget Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Contracts", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Claims and Returns", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Catalog Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Subscription Management", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Platform Branding", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Data Backup and Recovery", createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: "Notification Management", createdAt: new Date(), updatedAt: new Date() }
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