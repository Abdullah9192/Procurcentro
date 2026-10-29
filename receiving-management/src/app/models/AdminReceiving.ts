import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface AdminReceivingAttributes {
  id: string;
  purchase_order_id: string;
  order_id: string;
  requisition_id: string;
  selected_supplier_id: string;
  organization_id: string;
  subsidiary_id?: string | null;
  subsidiary_branch_id?: string | null;
  branch_department_id?: string | null;
  status: "pending" | "received" | "rejected" | "partially_received";
  comment?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface AdminReceivingCreationAttributes extends Optional<
  AdminReceivingAttributes,
  | "id"
  | "subsidiary_id"
  | "subsidiary_branch_id"
  | "branch_department_id"
  | "comment"
  | "created_at"
  | "updated_at"
> {}

class AdminReceiving
  extends Model<AdminReceivingAttributes, AdminReceivingCreationAttributes>
  implements AdminReceivingAttributes
{
  public id!: string;
  public purchase_order_id!: string;
  public order_id!: string;
  public requisition_id!: string;
  public selected_supplier_id!: string;
  public organization_id!: string;
  public subsidiary_id!: string | null;
  public subsidiary_branch_id!: string | null;
  public branch_department_id!: string | null;
  public status!: "pending" | "received" | "rejected" | "partially_received";
  public comment!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AdminReceiving.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    purchase_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requisition_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    selected_supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subsidiary_branch_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    branch_department_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "received", "rejected", "partially_received"),
      allowNull: false,
      defaultValue: "pending",
    },
    comment: {
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
    tableName: "admin_receivings",
    modelName: "AdminReceiving",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AdminReceiving;
