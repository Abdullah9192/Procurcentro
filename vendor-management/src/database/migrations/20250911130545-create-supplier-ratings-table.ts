import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("supplier_ratings", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      supplier_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rating_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      quality_item_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fullfill_order_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resolving_complaint_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
     shipment_terms_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      communication_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      experience_working_rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      overall_rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("supplier_ratings");
  },
};
