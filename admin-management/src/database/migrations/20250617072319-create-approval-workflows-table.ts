import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("approval_workflows", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "organizations",
          key: "id",
        },
        onDelete: "CASCADE",
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approval_type: {
        type: DataTypes.STRING(50),
        defaultValue: "linear",
      },
      allow_approval_comments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      allow_rejection_comments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      reminder_enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      reminder_frequency: {
        type: DataTypes.STRING(20),
        defaultValue: "12",
      },
      escalate_enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      escalate_to: {
        type: DataTypes.STRING(50),
        defaultValue: "admin",
      },
      skip_if_requester_is_approver: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      auto_approve_multiple_steps: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("approval_workflows");
  },
};
