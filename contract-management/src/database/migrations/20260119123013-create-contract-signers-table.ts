import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("contract_signers", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      contract_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "contracts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      signer_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Used for sequential signing",
      },
      
      // 🔹 BoldSign tracking
      boldsign_signer_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "sent",
          "viewed",
          "signed",
          "declined"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      signer_type: {
        type: DataTypes.ENUM("organization", "counter_party"),
        allowNull: false,
        comment: "Field belongs to which party",
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

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("contract_signers");
  },
};
