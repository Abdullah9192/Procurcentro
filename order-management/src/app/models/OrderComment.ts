import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface OrderCommentAttributes {
  id: string;
  order_id: string;
  organization_id: string;
  comment: string;
  status: "pending" | "resolved" | "delayed" | "rejected";
  type: "order" | "receiving" | "invoice";
  created_by: string;
  created_user_name: string;
  parent_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type OrderCommentCreationAttributes = Optional<
  OrderCommentAttributes,
  "id" | "parent_id" | "created_at" | "updated_at"
>;

class OrderComment
  extends Model<OrderCommentAttributes, OrderCommentCreationAttributes>
  implements OrderCommentAttributes {
  public id!: string;
  public order_id!: string;
  public organization_id!: string;
  public comment!: string;
  public status!: "pending" | "resolved" | "delayed" | "rejected";
  public type!: "order" | "receiving" | "invoice";
  public created_by!: string;
  public created_user_name!: string;
  public parent_id?: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

}

OrderComment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved", "delayed", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    type: {
      type: DataTypes.ENUM("order", "receiving", "invoice"),
      allowNull: false,
      defaultValue: "order",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
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
    tableName: "order_comments",
    modelName: "OrderComment",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["order_id"] },
      { fields: ["organization_id"] },
      { fields: ["parent_id"] },
      { fields: ["type"] },
    ],
  }
);

export default OrderComment;
