import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export interface ShareOrderAttributes {
  id: string;
  order_id: string;
  email: string;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ShareOrderCreationAttributes
  extends Optional<ShareOrderAttributes, "id" | "notes" | "created_at" | "updated_at"> {}

class ShareOrder
  extends Model<ShareOrderAttributes, ShareOrderCreationAttributes>
  implements ShareOrderAttributes
{
  public id!: string;
  public order_id!: string;
  public email!: string;
  public notes!: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ShareOrder.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    tableName: "share_orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ShareOrder;
