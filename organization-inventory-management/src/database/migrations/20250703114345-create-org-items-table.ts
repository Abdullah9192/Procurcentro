// migrations/[timestamp]-create-org-items.ts
import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("org_items", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      org_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      org_sub_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      org_service_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      brand_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      estimated_stock_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_shipping_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_tax_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_total_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      stock_renewal_trigger: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      low_inventory_notification: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      length: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      width: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      unit: {
        type: DataTypes.ENUM('piece', 'box', 'pack', 'daily', 'hourly', 'monthly', 'litre', 'meter'),
        allowNull: true,
      },
      total_stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("item", "service"),
        allowNull: false,
        defaultValue: "item",
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
    await queryInterface.dropTable("org_items");
  },
};
