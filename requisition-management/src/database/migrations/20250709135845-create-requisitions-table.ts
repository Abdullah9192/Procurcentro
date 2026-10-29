import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("requisitions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      request_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      expected_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      expected_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subsidiary_branch_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      branch_department_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      receiving_location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      request_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      approval_workflow_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "in_revision",
          "approved",
          "completed",
          "rejected",
          "draft"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      type: {
        type: DataTypes.ENUM("internal", "external"),
        allowNull: false,
      },
      request_type: {
        type: DataTypes.ENUM("service", "item"),
        allowNull: false,
      },
      last_action_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      total_request_amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.addConstraint("requisitions", {
      fields: ["organization_id", "request_id"],
      type: "unique",
      name: "unique_request_id_per_organization",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("requisitions", "unique_request_id_per_organization");
    await queryInterface.dropTable("requisitions");
  },
};
