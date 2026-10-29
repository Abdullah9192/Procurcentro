// models/ApprovalRequisition.ts
import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface ApprovalRequisitionAttributes {
  id: string;
  requisition_id: string;
  approval_id: string;
  approval_role_id: string;
  approval_role_name: string;
  approval_user_type: string;
  status_reason: string;
  status: "in_revision" | "approved" | "completed" | "rejected";
  created_at?: Date;
  updated_at?: Date;
}

type ApprovalRequisitionCreationAttributes = Optional<
  ApprovalRequisitionAttributes,
  "id" | "created_at" | "updated_at" | "status_reason"
>;

class ApprovalRequisition
  extends Model<
    ApprovalRequisitionAttributes,
    ApprovalRequisitionCreationAttributes
  >
  implements ApprovalRequisitionAttributes
{
  public id!: string;
  public requisition_id!: string;
  public approval_id!: string;
  public approval_role_id!: string;
  public approval_role_name!: string;
  public approval_user_type!: string;
  public status_reason!: string;
  public status!:
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected";
  public created_at!: Date;
  public updated_at!: Date;
}

ApprovalRequisition.init(
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
    approval_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approval_role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approval_role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approval_user_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "in_revision",
        "approved",
        "completed",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    status_reason: {
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
    tableName: "approval_requisitions",
    modelName: "ApprovalRequisition",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ApprovalRequisition;
