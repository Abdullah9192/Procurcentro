import { DataTypes, QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('org_role_module_permissions', {
       id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      org_role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'org_roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      module_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add composite index for the foreign keys
    await queryInterface.addIndex('org_role_module_permissions', 
      ['org_role_id', 'module_id', 'organization_id'], 
      {
        name: 'org_role_module_permissions_composite_index',
        unique: true
      }
    );
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // Remove the index first
    await queryInterface.removeIndex(
      'org_role_module_permissions', 
      'org_role_module_permissions_composite_index'
    );
    // Then drop the table
    await queryInterface.dropTable('org_role_module_permissions');
  },
};