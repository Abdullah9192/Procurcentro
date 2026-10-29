// migrations/create-quotations.ts
import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("quotations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quote_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requisition_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      request_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      requisition_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requisition_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shipping_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payment_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      response_due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      expected_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      receiving_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      subsidiary_branch_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      branch_department_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      selected_supplier_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      scoring_configuration_type: {
        type: DataTypes.ENUM("default", "split", "composite"),
        allowNull: false,
        defaultValue: "default",
      },
      approval_workflow_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("item", "service"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending_approval",
          "pending_response",
          "supplier_approved",
          "received",
          "in_negotiation",
          "in_revision",
          "approved",
          "completed",
          "rejected",
          "draft"
        ),
        allowNull: false,
        defaultValue: "pending_approval",
      },
      enable_bidding: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      bid_type: {
        type: DataTypes.ENUM("open", "closed"),
        allowNull: true,
      },
      bid_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bid_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bid_min_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      bid_max_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      last_action_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      total_quotation_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("quotations");
  },
};
