// migrations/create-quotation-suppliers.ts
import { QueryInterface, DataTypes } from "sequelize";
export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("quotation_suppliers", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      supplier_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      warranty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_supplier_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      total_bid_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      bid_status: {
        type: DataTypes.ENUM("sent", "withdrawn"),
        allowNull: true,
      },
      bid_date_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      supplier_status: {
        type: DataTypes.ENUM(
          "pending_response",
          "sent",
          "in_negotiation",
          "in_revision",
          "approved",
          "completed",
          "rejected",
          "draft"
        ),
        allowNull: true,
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      line_items: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: true,
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
    await queryInterface.dropTable("quotation_suppliers");
  },
};
