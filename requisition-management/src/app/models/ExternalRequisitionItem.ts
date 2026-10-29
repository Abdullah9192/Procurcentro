import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface ExternalRequisitionItemAttributes {
  id: string;
  requisition_id: string;
  item_name: string;

  item_image: string | null;
  category_name: string;
  unit: string | null;
  stock_available: number | null;

  org_category_id: string;
  budget_id: string;
  budget_item_id: string;
  quantity: number;
  use_type: "one_time" | "recurring";
  unit_price: number;
  org_currency_id: string;
  comment?: string | null;
  frequency?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  total_price: number;
  created_at?: Date;
  updated_at?: Date;
}

type ExternalRequisitionItemCreationAttributes = Optional<
  ExternalRequisitionItemAttributes,
  | "id"
  | "comment"
  | "frequency"
  | "start_date"
  | "end_date"
  | "created_at"
  | "updated_at"
  | "item_image"
  | "category_name"
  | "unit"
  | "stock_available"
>;

class ExternalRequisitionItem extends Model<
  ExternalRequisitionItemAttributes,
  ExternalRequisitionItemCreationAttributes
> {
  public id!: string;
  public requisition_id!: string;
  public item_name!: string;
  public item_image!: string | null;
  public category_name!: string | null;
  public unit!: string | null;
  public stock_available!: number | null;
  public org_category_id!: string;
  public budget_id!: string;
  public budget_item_id!: string;
  public quantity!: number;
  public use_type!: "one_time" | "recurring";
  public unit_price!: number;
  public org_currency_id!: string;
  public comment?: string | null;
  public frequency?: string | null;
  public start_date?: Date | null;
  public end_date?: Date | null;
  public total_price!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

ExternalRequisitionItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requisition_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock_available: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    use_type: {
      type: DataTypes.ENUM("one_time", "recurring"),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    org_currency_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
    tableName: "external_requisition_items",
    modelName: "ExternalRequisitionItem",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ExternalRequisitionItem;
