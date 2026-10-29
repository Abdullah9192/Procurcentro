import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {

    await queryInterface.createTable("organization_settings", {
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
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "subsidiaries",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.ENUM(
          "purchase_requisition",
          "quotations",
          "purchase_orders",
          "invoice",
          "inventory",
          "contract"
        ),
        allowNull: false,
      },
      settings: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    // Add indexes
    await queryInterface.addIndex(
      "organization_settings",
      ["organization_id", "subsidiary_id", "type"],
      {
        unique: true,
        name: "organization_settings_unique_constraint",
      }
    );

    await queryInterface.addIndex(
      "organization_settings",
      ["organization_id"],
      {
        name: "organization_settings_organization_id_index",
      }
    );

    await queryInterface.addIndex("organization_settings", ["subsidiary_id"], {
      name: "organization_settings_subsidiary_id_index",
    });

    await queryInterface.addIndex("organization_settings", ["type"], {
      name: "organization_settings_type_index",
    });

    await queryInterface.addIndex("organization_settings", ["created_by"], {
      name: "organization_settings_created_by_index",
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Remove indexes first
    await queryInterface.removeIndex(
      "organization_settings",
      "organization_settings_created_by_index"
    );
    await queryInterface.removeIndex(
      "organization_settings",
      "organization_settings_type_index"
    );
    await queryInterface.removeIndex(
      "organization_settings",
      "organization_settings_subsidiary_id_index"
    );
    await queryInterface.removeIndex(
      "organization_settings",
      "organization_settings_organization_id_index"
    );
    await queryInterface.removeIndex(
      "organization_settings",
      "organization_settings_unique_constraint"
    );

    // Drop the table
    await queryInterface.dropTable("organization_settings");

    // Drop the ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_organization_settings_type";'
    );
  },
};
