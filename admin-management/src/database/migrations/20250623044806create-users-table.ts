import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("users", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_supplier_capable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      supplier_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier_status_reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier_approval_type: {
        type: DataTypes.ENUM("profile_update", "registration", "black_list", "suspended", "rectification" , "approved" , "rejected", "pending_approval"),
        allowNull: true,
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      microsoft_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_owner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      user_type: {
        type: DataTypes.ENUM("employee", "admin", "vendor"),
        allowNull: false,
        defaultValue: "employee",
      },
      org_role_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "org_roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      email_verification_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email_verification_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reset_password_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      subsidiary_branch_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      branch_department_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      subsidiary_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      is_head_department: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      onboard_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      stepper: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
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

    // Add indexes for better query performance
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "users_email_unique",
    });
    await queryInterface.addIndex("users", ["org_role_id"], {
      name: "users_org_role_id",
    });
    await queryInterface.addIndex("users", ["organization_id"], {
      name: "users_organization_id",
    });
    await queryInterface.addIndex("users", ["created_by"], {
      name: "users_created_by",
    });
    await queryInterface.addIndex("users", ["google_id"], {
      name: "users_google_id",
    });
    await queryInterface.addIndex("users", ["microsoft_id"], {
      name: "users_microsoft_id",
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Remove indexes first
    await queryInterface.removeIndex("users", "users_email_unique");
    await queryInterface.removeIndex("users", "users_org_role_id");
    await queryInterface.removeIndex("users", "users_organization_id");
    await queryInterface.removeIndex("users", "users_created_by");
    await queryInterface.removeIndex("users", "users_google_id");
    await queryInterface.removeIndex("users", "users_microsoft_id");

    // Drop the table
    await queryInterface.dropTable("users");

    // Drop ENUM types explicitly (for PostgreSQL)
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_users_user_type";`
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_users_supplier_approval_type";`
    );
  },
};
