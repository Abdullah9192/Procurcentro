import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface CatalogueLocation {
  subsidiary_branch_id: string;
  current_stock_quantity: number;
}

interface SupplierCatalogueAttributes {
  id: string;
  organization_id: string;
  user_id: string;
  item_name: string;
  item_description: string | null;
  supplier_category_id: string;
  brand_name: string | null;
  sku: string | null;
  stock_price: number | null;
  estimated_shipping_price: number | null;
  estimated_tax: number | null;
  estimated_total_price: number | null;
  dimensions: string | null;
  weight: string | null;
  type: "item" | "service";
  is_active: boolean;
  locations?: CatalogueLocation[] | null;
  unit:
  | "piece"
  | "box"
  | "pack"
  | "daily"
  | "hourly"
  | "monthly"
  | "litre"
  | "meter"
  | null;
  created_at?: Date;
  updated_at?: Date;
}

type SupplierCatalogueCreationAttributes = Optional<
  SupplierCatalogueAttributes,
  | "id"
  | "item_description"
  | "brand_name"
  | "sku"
  | "stock_price"
  | "estimated_shipping_price"
  | "estimated_tax"
  | "estimated_total_price"
  | "dimensions"
  | "weight"
  | "locations"
  | "unit"
  | "created_at"
  | "updated_at"
>;

class SupplierCatalogue
  extends Model<
    SupplierCatalogueAttributes,
    SupplierCatalogueCreationAttributes
  >
  implements SupplierCatalogueAttributes {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;
  public item_name!: string;
  public item_description!: string | null;
  public supplier_category_id!: string;
  public brand_name!: string | null;
  public sku!: string | null;

  public stock_price!: number | null;
  public estimated_shipping_price!: number | null;
  public estimated_tax!: number | null;
  public estimated_total_price!: number | null;

  public dimensions!: string | null;
  public weight!: string | null;

  public type!: "item" | "service";
  public is_active!: boolean;

  public locations!: { subsidiary_branch_id: string; current_stock_quantity: number; }[] | null;

  public unit!:
    | "piece"
    | "box"
    | "pack"
    | "daily"
    | "hourly"
    | "monthly"
    | "litre"
    | "meter"
    | null;

  public created_at!: Date;
  public updated_at!: Date;
}

SupplierCatalogue.init(
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
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    supplier_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    brand_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    // NEW FIELDS ADDED (from migration)
    stock_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_shipping_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_tax: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimated_total_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    dimensions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM("item", "service"),
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    locations: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    unit: {
      type: DataTypes.ENUM(
        "piece",
        "box",
        "pack",
        "daily",
        "hourly",
        "monthly",
        "litre",
        "meter"
      ),
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
    tableName: "supplier_catalogues",
    modelName: "SupplierCatalogue",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupplierCatalogue;
