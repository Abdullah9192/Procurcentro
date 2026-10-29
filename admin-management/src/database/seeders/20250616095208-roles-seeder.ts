// roles-seeder.ts
import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkInsert("roles", [
      {
        id: uuidv4(),
        role_name: "Admin",
        description:
          "Manages system settings, user roles, permissions, and oversees overall platform operations",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Vendor",
        description:
         "Provides goods or services, responds to requests, submits quotes, and manages order fulfillment",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Requestor",
        description:
          "Creates requests for items or services, tracks approvals, and monitors orders and deliveries",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Approver",
        description:
          "Reviews and approves requests, ensuring compliance and alignment with organizational goals",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Procurement Manager",
        description:
          "Manages vendors, contracts, inventory, and procurement workflows, ensuring efficiency and accuracy",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Finance",
        description:
          "Tracks budgets, validates invoices, processes claims, and generates financial reports",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        role_name: "Legal",
        description:
          "Oversees contracts, reviews vendor agreements, and manages documentation related to procurement activities",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete("roles", {
      role_name: [
        "Requestor",
        "Approver",
        "Procurement Manager",
        "Finance",
        "Legal",
      ],
    });
  },
};
