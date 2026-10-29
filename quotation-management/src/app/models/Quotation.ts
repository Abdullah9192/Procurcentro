import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface QuotationAttributes {
  id: string;
  quote_id: string;
  requisition_id?: string;
  request_id?: string;
  requisition_title: string;
  requisition_date?: Date;
  priority: string;
  shipping_terms?: string;
  payment_terms?: string;
  response_due_date?: Date;
  expected_delivery_date?: Date;
  receiving_location: string;
  attachments?: object;
  subsidiary_id?: string;
  subsidiary_branch_id?: string;
  branch_department_id?: string;
  organization_id: string;
  selected_supplier_id?: string;
  scoring_configuration_type: "default" | "split" | "composite";
  approval_workflow_id?: string;
  type: "item" | "service";
  status:
    | "pending_approval"
    | "pending_response"
    | "received"
    | "supplier_approved"
    | "in_negotiation"
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected"
    | "draft";
  enable_bidding: boolean;
  bid_type?: "open" | "closed";
  bid_start_date?: Date;
  bid_end_date?: Date;
  bid_min_percent?: number;
  bid_max_percent?: number;
  created_by: string;
  last_action_by?: string;
  total_quotation_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

type QuotationCreationAttributes = Optional<
  QuotationAttributes,
  | "id"
  | "requisition_date"
  | "shipping_terms"
  | "payment_terms"
  | "response_due_date"
  | "expected_delivery_date"
  | "attachments"
  | "subsidiary_id"
  | "subsidiary_branch_id"
  | "branch_department_id"
  | "selected_supplier_id"
  | "scoring_configuration_type"
  | "approval_workflow_id"
  | "bid_type"
  | "bid_start_date"
  | "bid_end_date"
  | "bid_min_percent"
  | "bid_max_percent"
  | "last_action_by"
  | "created_at"
  | "updated_at"
>;

class Quotation
  extends Model<QuotationAttributes, QuotationCreationAttributes>
  implements QuotationAttributes
{
  public id!: string;
  public quote_id!: string;
  public requisition_id?: string;
  public request_id?: string;
  public requisition_title!: string;
  public requisition_date?: Date;
  public priority!: string;
  public shipping_terms?: string;
  public payment_terms?: string;
  public response_due_date?: Date;
  public expected_delivery_date?: Date;
  public receiving_location!: string;
  public attachments?: object;
  public subsidiary_id?: string;
  public subsidiary_branch_id?: string;
  public branch_department_id?: string;
  public organization_id!: string;
  public selected_supplier_id?: string;
  public scoring_configuration_type!: "default" | "split" | "composite";
  public approval_workflow_id?: string;
  public type!: "item" | "service";
  public status!:
    | "pending_approval"
    | "pending_response"
    | "received"
    | "supplier_approved"
    | "in_negotiation"
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected"
    | "draft";
  public enable_bidding!: boolean;
  public bid_type?: "open" | "closed";
  public bid_start_date?: Date;
  public bid_end_date?: Date;
  public bid_min_percent?: number;
  public bid_max_percent?: number;
  public created_by!: string;
  public last_action_by?: string;
  public total_quotation_amount!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Quotation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quote_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requisition_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    request_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    requisition_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requisition_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipping_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    response_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expected_delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    receiving_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    selected_supplier_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    scoring_configuration_type: {
      type: DataTypes.ENUM("default", "split", "composite"),
      allowNull: false,
      defaultValue: "default",
    },
    approval_workflow_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("item", "service"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending_approval",
        "pending_response",
        "received",
        "supplier_approved",
        "in_negotiation",
        "in_revision",
        "approved",
        "completed",
        "rejected",
        "draft"
      ),
      allowNull: false,
      defaultValue: "pending_response",
    },
    enable_bidding: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    bid_type: {
      type: DataTypes.ENUM("open", "closed"),
      allowNull: true,
    },
    bid_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bid_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bid_min_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    bid_max_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    last_action_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_quotation_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
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
    modelName: "Quotation",
    tableName: "quotations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Quotation;
