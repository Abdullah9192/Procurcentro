import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("contracts", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      contract_status: {
        type: DataTypes.ENUM(
          "draft",
          "signed_and_active",
          "signed_and_non_active",
        ),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "approved",
          "pending_approval",
          "rejected",
          "revision",
        ),
        allowNull: false,
      },
      contract_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      signed_document: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      author_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      author_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author_department_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      author_department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      counter_party: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      counter_party_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      counter_party_primary_contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contract_term: {
        type: DataTypes.ENUM("definite", "indefinite"),
        allowNull: false,
      },
      contract_effect_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      effective_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      termination_notice_period: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_contract_renewable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      expiration_reminder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      initiated_by: {
        type: DataTypes.ENUM("organization", "external_party"),
        allowNull: true,
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
      renewal_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      renewal_term: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      non_renew_notice_period: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      template_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Contract template reference",
      },
      boldsign_document_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "BoldSign document workflow id",
      },
      boldsign_status: {
        type: DataTypes.ENUM(
          "draft",
          "sent",
          "in_progress",
          "completed",
          "declined",
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
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("contracts");
  },
};
