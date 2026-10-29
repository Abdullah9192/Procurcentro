"use strict";

import { QueryInterface, DataTypes } from "sequelize";

export = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      log_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      subsidiary: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      department_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      change: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action_performed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feature: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      change_log: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable("audit_logs");
  },
};
