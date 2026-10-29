import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('org_roles', {
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
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

    // Add index for organization_id for better query performance
    await queryInterface.addIndex('org_roles', ['organization_id'], {
      name: 'org_roles_organization_id_index'
    });

    // Add composite index for role_name and organization_id to ensure unique role names per org
    await queryInterface.addIndex('org_roles', ['role_name', 'organization_id'], {
      name: 'org_roles_role_name_organization_id_unique',
      unique: true
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Remove indexes first
    await queryInterface.removeIndex('org_roles', 'org_roles_organization_id_index');
    await queryInterface.removeIndex('org_roles', 'org_roles_role_name_organization_id_unique');
    // Then drop the table
    await queryInterface.dropTable('org_roles');
  },
};