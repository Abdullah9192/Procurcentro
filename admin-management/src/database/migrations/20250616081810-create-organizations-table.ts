import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    
    await queryInterface.createTable("organizations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      company_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primary_email: {
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
      zip_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primary_contact_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stepper: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_profile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_setting: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_permission: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_supplier: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

    // Add index for the unique name field
    await queryInterface.addIndex("organizations", ["name"], {
      unique: true,
      name: "organizations_name_unique",
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("organizations");
  },
};
