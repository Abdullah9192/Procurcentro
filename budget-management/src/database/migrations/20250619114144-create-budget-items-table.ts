import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("budget_items", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      budget_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      org_sub_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      warning_limit: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      allow_exceed_budget: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      limit_exceed_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      spent_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable("budget_items");
  },
};
