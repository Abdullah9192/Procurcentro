import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("supplier_kycs", {
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
      // KYC document fields
      nsitf_cert_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itf_cert_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pencom_cert_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interim_reg_report_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      proof_of_address_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_cert_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      moa_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      upstream_cert_number: {
        type: DataTypes.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("supplier_kycs");
  },
};
