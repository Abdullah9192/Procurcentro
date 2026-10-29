import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("orders", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      order_gen_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
      organization_id: {
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
      admin_status: {
        type: DataTypes.ENUM(
          "pending_approval",
          "not_fulfilled",
          "delivered",
          "sent",
          "in_revision",
          "approved",
          "completed",
          "rejected",
          "supplier_accepted",
          "supplier_rejected",
          "draft",
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      supplier_status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "rejected",
          "in_fulfilment",
          "delivered",
          "partially_delivered",
        ),
        allowNull: true,
      },
      receiving_status: {
        type: DataTypes.ENUM(
          "awaiting_receipt",
          "pending",
          "received",
          "rejected",
          "partially_received",
          "awaiting_confirmation"
        ),
        allowNull: true,
      },
      invoice_admin_status: {
        type: DataTypes.ENUM(
          "pending_invoice",
          "rejected",
          "paid",
          "partially_paid",
          "unmatched_invoice",
          "pending_payment"
        ),
        allowNull: true,
      },
      invoice_supplier_status: {
        type: DataTypes.ENUM(
          "partially_received_invoice_pending",
          "fully_invoiced_payment_pending",
          "fully_invoiced_paid",
          "partially_invoiced_paid",
          "fully_received_invoice_pending",
          "partially_invoiced_payment_pending"
        ),
        allowNull: true,
      },
      selected_supplier_id: {
        type: DataTypes.UUID,
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
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      total_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      total_bid_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      warranty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shipping_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payment_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      receiving_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supplier_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      docs: {
        type: DataTypes.JSONB,
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
    await queryInterface.dropTable("orders");
  },
};
