// migrations/YYYYMMDDHHMMSS-create-approval-purchase-orders-table.ts

import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("approval_purchase_orders", {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            order_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            approval_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            approval_role_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            approval_role_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            approval_user_type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("approved", "rejected", "pending"),
                allowNull: false,
                defaultValue: "pending",
            },
            status_reason: {
                type: DataTypes.TEXT,
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
        await queryInterface.dropTable("approval_purchase_orders");
    },
};
