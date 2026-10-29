import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface ApprovalBudgetAttributes {
  id: string;
  budget_id: string;
  approval_id: string;
  approval_role_id: string;
  approval_role_name: string;
  approval_user_type: string;
  status: "in_revision" | "approved" | "completed" | "rejected";
  status_reason?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type ApprovalBudgetCreationAttributes = Optional<
  ApprovalBudgetAttributes,
  "id" | "status_reason" | "created_at" | "updated_at"
>;

class ApprovalBudget
  extends Model<ApprovalBudgetAttributes, ApprovalBudgetCreationAttributes>
  implements ApprovalBudgetAttributes
{
  public id!: string;
  public budget_id!: string;
  public approval_id!: string;
  public approval_role_id!: string;
  public approval_role_name!: string;
  public approval_user_type!: string;
  public status!: "in_revision" | "approved" | "completed" | "rejected";
  public status_reason?: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

ApprovalBudget.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    budget_id: {
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
      type: DataTypes.ENUM("in_revision", "approved", "completed", "rejected"),
      allowNull: false,
      defaultValue: "in_revision",
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
    tableName: "approval_budgets",
    modelName: "ApprovalBudget",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ApprovalBudget;
