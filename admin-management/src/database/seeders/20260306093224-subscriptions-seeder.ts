import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const subscriptions = [
      // ---------- MONTHLY PLANS ----------
      {
        id: uuidv4(),
        subscription_plan: "starter",
        plan_type: "monthly",
        amount: 49,
        no_of_users: 20,
        description: "Best for startups and small businesses",
        features: JSON.stringify([
          "Self-service setup",
          "Requisition management",
          "Quotation management",
          "Budgeting & cost tracking",
          "Supplier management",
          "Purchase order processing",
          "Order receiving",
          "Invoicing & 3-Way Matching",
          "Customizable system settings",
          "Unlimited requesters and approvers",
          "Default reports & analytics",
          "Custom domain"
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subscription_plan: "professional",
        plan_type: "monthly",
        amount: 149,
        no_of_users: 100,
        description: "Best for medium-sized companies",
        features: JSON.stringify([
          "Supplier portal",
          "Audit trail",
          "Inventory management",
          "Catalogue management",
          "Custom reports",
          "Scheduled reports",
          "Single sign-on integration",
          "Up to 10 administrative users",
          "Multi-level approval workflows",
          "ERP & accounting software integration",
          "24/7 chat & email support",
          "Advanced security role-based access"
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subscription_plan: "enterprise",
        plan_type: "monthly",
        amount: null,
        no_of_users: null,
        description: "Best for large organizations",
        features: JSON.stringify([
          "Custom integrations",
          "Up to 20 administrative users",
          "Dedicated Account Manager",
          "Contract lifecycle management",
          "AI-driven supplier insights",
          "Customized reports with API integration",
          "Enterprise-grade security",
          "Custom procurement workflows",
          "On-premise deployment option"
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },

      // ---------- YEARLY PLANS ----------
      {
        id: uuidv4(),
        subscription_plan: "starter",
        plan_type: "yearly",
        amount: 470,
        no_of_users: 20,
        description: "Best for startups and small businesses",
        features: JSON.stringify([
          "Self-service setup",
          "Requisition management",
          "Quotation management",
          "Budgeting & cost tracking",
          "Supplier management",
          "Purchase order processing",
          "Order receiving",
          "Invoicing & 3-Way Matching",
          "Customizable system settings",
          "Unlimited requesters and approvers",
          "Default reports & analytics",
          "Custom domain"
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subscription_plan: "professional",
        plan_type: "yearly",
        amount: 1430,
        no_of_users: 100,
        description: "Best for medium-sized companies",
        features: JSON.stringify([
          "Supplier portal",
          "Audit trail",
          "Inventory management",
          "Catalogue management",
          "Custom reports",
          "Scheduled reports",
          "Single sign-on integration",
          "Up to 10 administrative users",
          "Multi-level approval workflows",
          "ERP & accounting software integration",
          "24/7 chat & email support",
          "Advanced security role-based access"
        ]),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        subscription_plan: "enterprise",
        plan_type: "yearly",
        amount: null,
        no_of_users: null,
        description: "Best for large organizations",
        features: JSON.stringify([
          "Custom integrations",
          "Up to 20 administrative users",
          "Dedicated Account Manager",
          "Contract lifecycle management",
          "AI-driven supplier insights",
          "Customized reports with API integration",
          "Enterprise-grade security",
          "Custom procurement workflows",
          "On-premise deployment option"
        ]),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert("subscriptions", subscriptions);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete("subscriptions", {
      subscription_plan: ["starter", "professional", "enterprise"]
    });
  }
};