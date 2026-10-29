import {
  Model,
  DataTypes,
  Optional
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface OrgItemLocationAttributes {
  id: string;
  org_item_id: string;
  subsidiary_branch_id: string;
  location: string;
  current_stock_quantity: number;
  created_at: Date;
  updated_at: Date;
}

type OrgItemLocationCreationAttributes = Optional<
  OrgItemLocationAttributes,
  'id' | 'created_at' | 'updated_at' | 'current_stock_quantity'
>;

class OrgItemLocation extends Model<
  OrgItemLocationAttributes,
  OrgItemLocationCreationAttributes
> implements OrgItemLocationAttributes {
  public id!: string;
  public org_item_id!: string;
  public subsidiary_branch_id!: string;
  public location!: string;
  public current_stock_quantity!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

OrgItemLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    org_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subsidiary_branch_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    current_stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: 'org_item_locations',
    modelName: 'OrgItemLocation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrgItemLocation;
