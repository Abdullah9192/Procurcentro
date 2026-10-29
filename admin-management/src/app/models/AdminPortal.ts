import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Organization from './Organization';
import User from './User';
import Subsidiary from './Subsidiary';
import AdminDashboardWidget from './AdminDashboardWidget';

interface AdminPortalAttributes {
  id: string;
  organization_id: string;
  user_id: string;
  subsidiary_id: string;
  is_default: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type AdminPortalCreationAttributes = Optional<AdminPortalAttributes, 'id' | 'is_default' | 'created_at' | 'updated_at'>;

class AdminPortal extends Model<AdminPortalAttributes, AdminPortalCreationAttributes> implements AdminPortalAttributes {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;
  public subsidiary_id!: string;
  public is_default!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Relations
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;
  public getUser!: BelongsToGetAssociationMixin<User>;
  public getSubsidiary!: BelongsToGetAssociationMixin<Subsidiary>;
  public getAdminDashboardWidgets!: HasManyGetAssociationsMixin<AdminDashboardWidget>;
}

AdminPortal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    modelName: 'AdminPortal',
    tableName: 'admin_portals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);



export default AdminPortal;
