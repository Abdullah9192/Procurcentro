import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("order_supplier_items", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      requisition_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      invoice_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      org_currency_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      budget_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      budget_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      unit_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      discount_percentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      delivery_fees: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      tax_percentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      org_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      deliver_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      received_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ordered_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quantity_delivered: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pending_delivery_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      admin_receive: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      admin_rejected: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rejection_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      delivery_status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered", "delayed"),
        allowNull: true,
        defaultValue: "pending",
      },
      receiving_status: {
        type: DataTypes.ENUM("received", "partially_received", "rejected"),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("order_supplier_items");
  },
};
