import {
  Model, DataTypes, Optional, Association
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import OrgItemImage from './OrgItemImage';
import OrgItemLocation from './OrgItemLocation';

interface OrgItemAttributes {
  id: string;
  organization_id: string;
  subsidiary_id: string;
  user_id: string;
  unit: string | null;
  item_name: string;
  item_description: string | null;
  org_category_id: string;
  org_sub_category_id: string | null;
  org_service_category_id: string | null;
  brand_name: string | null;
  sku: string | null;
  estimated_stock_price: number;
  estimated_shipping_price: number;
  estimated_tax_price: number;
  estimated_total_price: number;
  stock_renewal_trigger: number;
  low_inventory_notification: number;
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  total_stock: number;
  weight_unit: string;
  type: 'item' | 'service';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type OrgItemCreationAttributes = Optional<
  OrgItemAttributes,
  | 'id'
  | 'item_description'
  | 'brand_name'
  | 'length'
  | 'width'
  | 'height'
  | 'weight'
  | 'created_at'
  | 'updated_at'
  | 'sku'
  | 'weight_unit'
>;

class OrgItem extends Model<OrgItemAttributes, OrgItemCreationAttributes>
  implements OrgItemAttributes {
  public id!: string;
  public organization_id!: string;
  public subsidiary_id!: string;
  public user_id!: string;

  public item_name!: string;
  public item_description!: string | null;
  public org_category_id!: string;
  public org_sub_category_id!: string | null;
  public org_service_category_id!: string | null;
  public brand_name!: string | null;
  public sku!: string | null;
  public estimated_stock_price!: number;
  public estimated_shipping_price!: number;
  public estimated_tax_price!: number;
  public estimated_total_price!: number;
  public stock_renewal_trigger!: number;
  public low_inventory_notification!: number;
  public length!: number | null;
  public width!: number | null;
  public height!: number | null;
  public weight!: number | null;
  public unit: string | null;
  public total_stock!: number;
  public weight_unit!: string;
  public type!: 'item' | 'service';
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public static associations: {
    images: Association<OrgItem, OrgItemImage>;
    locations: Association<OrgItem, OrgItemLocation>;
  };
  images: OrgItemImage[] | undefined;
}

OrgItem.init(
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
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    org_sub_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    org_service_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    brand_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    estimated_stock_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_shipping_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_tax_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_total_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    stock_renewal_trigger: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    low_inventory_notification: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.ENUM('piece', 'box', 'pack', 'daily', 'hourly', 'monthly', 'litre', 'meter'),
      allowNull: true,
    },
    weight_unit: {
      type: DataTypes.ENUM('kg', 'g', 'lb', 'oz'),
      allowNull: false,
      defaultValue: 'kg',
    },
    total_stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('item', 'service'),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'org_items',
    modelName: 'OrgItem',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrgItem;
