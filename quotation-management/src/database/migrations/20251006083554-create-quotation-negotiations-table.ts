import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // 1️⃣ Create quotation_negotiations table
    await queryInterface.createTable("quotation_negotiations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      quotation_supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "quotation_suppliers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      quotation_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // Negotiation offer details
      offered_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      offered_delivery_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      offered_delivery_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      offered_warranty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      offered_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      // Negotiation tracking
      initiated_by: {
        type: DataTypes.ENUM("admin", "supplier"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected", "revision"),
        allowNull: false,
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Revert changes
    await queryInterface.dropTable("quotation_negotiations");
  },
};
