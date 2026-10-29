"use strict";

import { DataTypes, QueryInterface } from "sequelize";
import {
  reportFrequenciesList,
  weekDaysList,
  reportTypesList,
  reportStatusesList,
  reportStatuses,
} from "../../app/utils/constants/index";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("reports", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_scheduled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      report_frequency: {
        type: DataTypes.ENUM(...reportFrequenciesList),
        allowNull: true,
      },
      frequency_day: {
        type: DataTypes.ENUM(...weekDaysList),
        allowNull: true,
      },
      frequency_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_format: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_decimal_symbol: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      report_type: {
        type: DataTypes.ENUM(...reportTypesList),
        allowNull: false,
      },
      report_columns: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      filter_start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      filter_end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      min_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      max_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      report_status: {
        type: DataTypes.ENUM(...reportStatusesList),
        allowNull: true,
        defaultValue: reportStatuses.Draft,
      },
      created_by: {
        type: DataTypes.UUID,
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

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("reports");
  },
};
