"use strict";

import { QueryInterface, DataTypes } from "sequelize";
import { bidStatuses } from "../../app/utils/constants";

export = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable("auction_bids", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      bid_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bid_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      auction_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      bid_status: {
        type: DataTypes.ENUM(...Object.values(bidStatuses)),
        defaultValue: bidStatuses.Outbid,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    // Drop ENUM first before dropping the table (important for Postgres)
    await queryInterface.dropTable("auction_bids");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_auction_bids_bid_status";'
    );
  },
};
