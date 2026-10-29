import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import OrgRoleModulePermission from './OrgRoleModulePermission';

interface OrgRoleAttributes {
  id: string;
  role_name: string;
  description: string | null;
  organization_id: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OrgRoleCreationAttributes extends Optional<OrgRoleAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt'> { }

class OrgRole extends Model<OrgRoleAttributes, OrgRoleCreationAttributes> implements OrgRoleAttributes {
  public id!: string;
  public role_name!: string;
  public description!: string | null;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly org_role_module_permissions?: OrgRoleModulePermission[];
}

OrgRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'OrgRole',
    tableName: 'org_roles',
    timestamps: true,
  }
);

export default OrgRole;
