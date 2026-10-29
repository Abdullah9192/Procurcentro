import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("supplier_credit_transactions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      document_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("purchase", "debit", "refund", "adjustment"),
        allowNull: false,
      },
      credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credits_purchased: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Number of credits purchased in this transaction",
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Total transaction amount in Naira",
      },
      amount_paid: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Amount actually paid in Naira",
      },
      payment_reference: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: "Paystack or payment gateway reference",
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "paystack",
        comment: "Payment provider used (e.g. paystack, stripe)",
      },
      status: {
        type: DataTypes.ENUM("pending", "successful", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Stores full Paystack response or webhook data",
      },
      balance_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: queryInterface.sequelize.literal("NOW()"),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: queryInterface.sequelize.literal("NOW()"),
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("supplier_credit_transactions");
  },
};
