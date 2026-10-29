import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("approval_budgets", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      budget_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      approval_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      approval_role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      approval_role_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      approval_user_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "in_revision",
          "approved",
          "completed",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "in_revision",
      },
      status_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("approval_budgets");
  },
};
