import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("contract_signer_fields", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
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

      contract_signer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "contract_signers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      field_type: {
        type: DataTypes.ENUM(
          "signature",
          "initials",
          "date",
          "name",
          "company_stamp",
          "text"
        ),
        allowNull: false,
        comment: "Type of signer field",
      },

      page_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "PDF page number (1-based index)",
      },

      x_position: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "X position",
      },

      y_position: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: "Y position",
      },

      width: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      height: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      boldsign_field_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Field id returned by BoldSign (if synced)",
      },

      is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable("contract_signer_fields");
  },
};
