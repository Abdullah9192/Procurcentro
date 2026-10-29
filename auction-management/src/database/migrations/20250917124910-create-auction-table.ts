import { DataTypes, QueryInterface } from "sequelize";
import {
  auctionStatuses,
  auctionStatusesList,
} from "../../app/utils/constants";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("auctions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      auction_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      from_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      to_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      start_bid_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reserve_bid_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minimum_bid_increment: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maximum_bid_increment: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_bid_open: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      max_bids_per_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      department: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
      },
      auction_status: {
        type: DataTypes.ENUM(...auctionStatusesList),
        defaultValue: auctionStatuses.Pending,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      transferred_to: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // Optional: add index on frequently queried fields
    await queryInterface.addIndex("auctions", ["auction_id"], {
      name: "auctions_auction_id_index",
    });
    await queryInterface.addIndex("auctions", ["auction_status"], {
      name: "auctions_status_index",
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Remove indexes first
    await queryInterface.removeIndex("auctions", "auctions_auction_id_index");
    await queryInterface.removeIndex("auctions", "auctions_status_index");

    // Drop the table
    await queryInterface.dropTable("auctions");

    // Clean up ENUM (important in Postgres)
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_auctions_auction_status";'
    );
  },
};
