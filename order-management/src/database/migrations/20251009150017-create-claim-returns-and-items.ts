import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // =========================
    // CLAIM RETURNS TABLE
    // =========================
    await queryInterface.createTable("claim_returns", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      claim_gen_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      date_raised: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      date_resolved: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      priority: {
        type: DataTypes.ENUM("high", "mid", "low"),
        allowNull: false,
      },

      admin_status: {
        type: DataTypes.ENUM(
          "pending_review",
          "pending_supplier_response",
          "approved",
          "disputed",
          "draft"
        ),
        allowNull: false,
        defaultValue: "pending_review",
      },

      supplier_status: {
        type: DataTypes.ENUM(
          "pending_response",
          "in_review",
          "accepted",
          "resolved",
          "disputed"
        ),
        allowNull: true,
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

    // =========================
    // CLAIM RETURN ITEMS TABLE
    // =========================
    await queryInterface.createTable("claim_return_items", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      claim_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      line_item_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      rejected_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      rejected_reason: {
        type: DataTypes.ENUM(
          "damaged",
          "wrong_item",
          "missing_part",
          "defective",
          "late_delivery",
          "incorrect_size",
          "faulty_mechanism",
          "expired_product",
          "unsatisfied_quality",
          "not_as_described",
          "poor_packaging",
          "customer_service_issue"
        ),
        allowNull: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      attach_evidence: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      resolution_type: {
        type: DataTypes.ENUM(
          "refund",
          "return",
          "replacement",
          "credit_note"
        ),
        allowNull: true,
      },

      additional_details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "accepted",
          "resolved",
          "disputed",
          "resolution_enforced"
        ),
        allowNull: false,
        defaultValue: "pending",
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

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("claim_return_items");
    await queryInterface.dropTable("claim_returns");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claim_returns_priority";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claim_returns_admin_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claim_returns_supplier_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claim_return_items_rejected_reason";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claim_return_items_resolution_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claim_return_items_status";'
    );
  },
};
