import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface RequisitionAttributes {
  id: string;
  request_id: string;
  organization_id: string;
  subsidiary_id: string | null;
  title: string;
  priority: string;

  subsidiary_branch_id: string | null;
  branch_department_id: string | null;
  receiving_location: string;
  request_date: string;
  approval_workflow_id: string;
  created_by: string;
  last_action_by: string;
  status: "pending" | "in_revision" | "approved" | "completed" | "rejected" | "draft";
  type: "internal" | "external";
  request_type: "service" | "item";
  expected_start_date: Date | null;
  expected_end_date: Date | null;
  total_request_amount: string; // Use string for DECIMAL
  created_at: Date;
  updated_at: Date;
}

type RequisitionCreationAttributes = Optional<
  RequisitionAttributes,
  | "id"
  | "created_at"
  | "updated_at"
  | "expected_start_date"
  | "expected_end_date"
  | "subsidiary_id"
  | "request_date"
  | "subsidiary_branch_id"
  | "branch_department_id"
  | "last_action_by"
  | "total_request_amount"
>;

class Requisition
  extends Model<RequisitionAttributes, RequisitionCreationAttributes>
  implements RequisitionAttributes
{
  public id!: string;
  public request_id!: string;
  public organization_id!: string;
  public subsidiary_id!: string | null;
  public title!: string;
  public priority!: string;
  public expected_start_date: Date | null;
  public expected_end_date: Date | null;
  public subsidiary_branch_id!: string | null;
  public branch_department_id!: string | null;
  public receiving_location!: string;
  public request_date: string;
  public approval_workflow_id!: string;
  public created_by!: string;
  public last_action_by!: string;

  public status!:
    | "pending"
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected"
    | "draft";
  public type!: "internal" | "external";
  public request_type!: "service" | "item";
  public total_request_amount!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Requisition.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.STRING,
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
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
    expected_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    receiving_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    request_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    approval_workflow_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "in_revision",
        "approved",
        "completed",
        "rejected",
        "draft",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    request_type: {
      type: DataTypes.ENUM("service", "item"),
      allowNull: false,
      defaultValue: "item",
    },
    type: {
      type: DataTypes.ENUM("internal", "external"),
      allowNull: false,
    },
    last_action_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_request_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "requisitions",
    modelName: "Requisition",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["organization_id", "request_id"],
        name: "unique_request_id_per_organization",
      },
    ],
  }
);

export default Requisition;
