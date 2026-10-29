import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("supplier_infos", {
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
      company_logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      business_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier_business_category_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      company_website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      business_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_incorporation: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      company_registration_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vat_registration_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_identification_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bank_verification_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Invite Supplier Checks Data
      certificate_of_incorporation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tax_clearance_certificate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      vat_registration: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      audited_accounts: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      financial_capability: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      banking_details: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable("supplier_infos");
  },
};
