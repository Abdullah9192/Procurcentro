import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
// import OrgRole from './OrgRole'; // Import related models
import Module from './Module';
import Organization from './Organization';
import type OrgRole from './OrgRole';
interface OrgRoleModulePermissionAttributes {
  id: string;
  org_role_id: string;
  module_id: string;
  organization_id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrgRoleModulePermissionCreationAttributes
  extends Optional<OrgRoleModulePermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class OrgRoleModulePermission extends Model<
  OrgRoleModulePermissionAttributes,
  OrgRoleModulePermissionCreationAttributes
> implements OrgRoleModulePermissionAttributes {
  public id!: string;
  public org_role_id!: string;
  public module_id!: string;
  public organization_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly org_role?: OrgRole;
  public readonly module?: Module;
  public readonly organization?: Organization;
}

OrgRoleModulePermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    modelName: 'OrgRoleModulePermission',
    tableName: 'org_role_module_permissions',
    timestamps: true,
    indexes: [
      {
        name: 'org_role_module_permissions_composite_index',
        unique: true,
        fields: ['org_role_id', 'module_id', 'organization_id']
      }
    ]
  }
);

// // Define associations
// OrgRoleModulePermission.belongsTo(OrgRole, {
//   foreignKey: 'org_role_id',
//   as: 'org_role'
// });

export function associateOrgRoleModulePermission(models: { OrgRole: typeof import('./OrgRole').default }) {
  OrgRoleModulePermission.belongsTo(models.OrgRole, {
    foreignKey: 'org_role_id',
    as: 'org_role',
  });
}

export function associateOrgRoleModulePermissionWithModule(models: { Module: typeof import('./Module').default }) {
  OrgRoleModulePermission.belongsTo(models.Module, {
    foreignKey: 'module_id',
    as: 'module',
  });
}



export default OrgRoleModulePermission;