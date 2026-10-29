import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("quotation_scoring_configurations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      quotation_scoring_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "quotation_scorings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      criteria: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
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

    await queryInterface.addIndex(
      "quotation_scoring_configurations",
      ["quotation_scoring_id"],
      { name: "quotation_scoring_configurations_scoring_id" }
    );
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex(
      "quotation_scoring_configurations",
      "quotation_scoring_configurations_scoring_id"
    );
    await queryInterface.dropTable("quotation_scoring_configurations");
  },
};
