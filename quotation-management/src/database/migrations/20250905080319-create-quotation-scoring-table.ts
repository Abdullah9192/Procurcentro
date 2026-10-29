import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("quotation_scorings", {
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
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      template_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      org_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      scoring_method: {
        type: DataTypes.ENUM("Hybrid", "Manual", "Auto"),
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM("Private", "Public"),
        allowNull: false,
        defaultValue: "Public",
      },
      restrict: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex("quotation_scorings", ["org_category_id"], {
      name: "quotation_scorings_org_category_id",
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex(
      "quotation_scorings",
      "quotation_scorings_org_category_id"
    );
    await queryInterface.dropTable("quotation_scorings");
  },
};
