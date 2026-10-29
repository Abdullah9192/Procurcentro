import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("order_receivings", {
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

      order_gen_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      quotation_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      quote_id: {
        type: DataTypes.STRING,
        allowNull: true,
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

      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      supplier_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      ship_to_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      received_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      grn_gen_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      invoice_gen_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      date_issued: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      sub_total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      vat: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      shipping: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      discount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      total_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      grn_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      invoice_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      order_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      order_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      receipt_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      grn_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      admin_invoice_status: {
        type: DataTypes.ENUM(
          "ready_for_invoice",
          "invoiced",
          "ready_for_billing"
        ),
        allowNull: true,
      },
      supplier_invoice_status: {
        type: DataTypes.ENUM(
          "ready_for_invoice",
          "invoiced",
          "ready_for_billing"
        ),
        allowNull: true,
      },
      invoice_requested: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },

      admin_payment_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      grn_items: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      invoice_items: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      order_items: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      invoice_reciept_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      account_payable_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      account_payable_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.0,
      },

      is_3way: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("order_receivings");
  },
};
