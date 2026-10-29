import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable('supplier_industries', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            created_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: queryInterface.sequelize.literal("NOW()"),
            },
            updated_at: {
                allowNull: false,
                type: DataTypes.DATE,
                defaultValue: queryInterface.sequelize.literal("NOW()"),
            },
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('supplier_industries');
    },
};