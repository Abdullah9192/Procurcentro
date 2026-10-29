import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('roles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
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

    // Add index for the role_name field if you expect frequent queries on it
    await queryInterface.addIndex('roles', ['role_name'], {
      name: 'roles_role_name_index'
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Remove the index first (if created)
    await queryInterface.removeIndex('roles', 'roles_role_name_index');
    // Then drop the table
    await queryInterface.dropTable('roles');
  },
};
