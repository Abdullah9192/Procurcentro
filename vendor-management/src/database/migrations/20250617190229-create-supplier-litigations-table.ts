import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("supplier_litigations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      client_performance_discussion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pending_legal_actions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      professional_misconduct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      insolvency_or_bankruptcy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tax_or_pension_arrears: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      declaration_certified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("supplier_litigations");
  },
};
