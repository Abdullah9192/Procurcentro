import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("supplier_catalogues", {
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
      item_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      supplier_category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      brand_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sku: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      stock_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_shipping_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_tax: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      estimated_total_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      dimensions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("item", "service"),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      unit: {
        type: DataTypes.ENUM(
          "piece",
          "box",
          "pack",
          "daily",
          "hourly",
          "monthly",
          "litre",
          "meter"
        ),
        allowNull: true,
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
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("supplier_catalogues");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_supplier_catalogues_type";`
    );
  },
};
