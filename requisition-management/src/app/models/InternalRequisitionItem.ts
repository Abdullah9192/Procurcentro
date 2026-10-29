import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface InternalRequisitionItemAttributes {
  id: string;
  requisition_id: string;
  org_item_id: string | null;

  item_name: string;
  item_image: string | null;
  category_name: string;
  unit: string | null;
  stock_available: number | null;

  quantity: number;
  use_type: "return" | "deplete";
  receipt_date: string;
  return_date: string | null;
  comment: string | null;

  created_at: Date;
  updated_at: Date;
}

type InternalRequisitionItemCreationAttributes = Optional<
  InternalRequisitionItemAttributes,
  | "id"
  | "org_item_id"
  | "item_image"
  | "unit"
  | "stock_available"
  | "return_date"
  | "comment"
  | "created_at"
  | "updated_at"
>;

class InternalRequisitionItem
  extends Model<
    InternalRequisitionItemAttributes,
    InternalRequisitionItemCreationAttributes
  >
  implements InternalRequisitionItemAttributes
{
  public id!: string;
  public requisition_id!: string;
  public org_item_id!: string | null;

  public item_name!: string;
  public item_image!: string | null;
  public category_name!: string;
  public unit!: string | null;
  public stock_available!: number | null;

  public quantity!: number;
  public use_type!: "return" | "deplete";
  public receipt_date!: string;
  public return_date!: string | null;
  public comment!: string | null;

  public created_at!: Date;
  public updated_at!: Date;
}

InternalRequisitionItem.init(
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
    org_item_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock_available: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    use_type: {
      type: DataTypes.ENUM("return", "deplete"),
      allowNull: false,
    },
    receipt_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
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
    tableName: "internal_requisition_items",
    modelName: "InternalRequisitionItem",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default InternalRequisitionItem;
