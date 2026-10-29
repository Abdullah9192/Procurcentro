import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface QuotationSupplierAttributes {
  id: string;
  supplier_id: string;
  quotation_id: string;
  subsidiary_id?: string | null;
  subsidiary_branch_id?: string | null;
  branch_department_id?: string | null;
  organization_id: string;
  supplier_delivery_date?: Date | null;
  warranty?: string | null;
  total_supplier_amount?: number | null;
  total_bid_amount?: number | null;
  bid_status?: "sent" | "withdraw" | null;
  bid_date_time?: Date | null;
  supplier_status?:
    | "pending_response"
    | "sent"
    | "in_negotiation"
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected"
    | "draft"
    | null;
  comments?: string | null;
  line_items?: Record<string, any>[] | null;
  attachments?: Record<string, any>[] | null;
  negotiate_price?: number | null;
  negotiate_delivery_date?: Date | null;
  negotiate_delivery_days?: number | null;
  negotiate_warranty?: string | null;
  negotiate_notes?: string | null;
  negotiate_status?: "pending" | "accepted" | "rejected" | null;
  created_at?: Date;
  updated_at?: Date;
}

type QuotationSupplierCreationAttributes = Optional<
  QuotationSupplierAttributes,
  | "id"
  | "subsidiary_id"
  | "subsidiary_branch_id"
  | "branch_department_id"
  | "supplier_delivery_date"
  | "warranty"
  | "total_supplier_amount"
  | "total_bid_amount"
  | "bid_status"
  | "bid_date_time"
  | "supplier_status"
  | "comments"
  | "line_items"
  | "attachments"
  | "negotiate_price"
  | "negotiate_delivery_date"
  | "negotiate_delivery_days"
  | "negotiate_warranty"
  | "negotiate_notes"
  | "negotiate_status"
  | "created_at"
  | "updated_at"
>;

class QuotationSupplier
  extends Model<QuotationSupplierAttributes, QuotationSupplierCreationAttributes>
  implements QuotationSupplierAttributes
{
  public id!: string;
  public supplier_id!: string;
  public quotation_id!: string;
  public subsidiary_id?: string | null;
  public subsidiary_branch_id?: string | null;
  public branch_department_id?: string | null;
  public organization_id!: string;
  public supplier_delivery_date?: Date | null;
  public warranty?: string | null;
  public total_supplier_amount?: number | null;
  public total_bid_amount?: number | null;
  public bid_status?: "sent" | "withdraw" | null;
  public bid_date_time?: Date | null;
  public supplier_status?:
    | "pending_response"
    | "sent"
    | "in_negotiation"
    | "in_revision"
    | "approved"
    | "completed"
    | "rejected"
    | "draft"
    | null;
  public comments?: string | null;
  public line_items?: Record<string, any>[] | null;
  public attachments?: Record<string, any>[] | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

QuotationSupplier.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quotation_id: {
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
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    supplier_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_supplier_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    total_bid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    bid_status: {
      type: DataTypes.ENUM("sent", "withdraw"),
      allowNull: true,
    },
    bid_date_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    supplier_status: {
      type: DataTypes.ENUM(
        "pending_response",
        "sent",
        "in_negotiation",
        "in_revision",
        "approved",
        "completed",
        "rejected",
        "draft"
      ),
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    line_items: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
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
    modelName: "QuotationSupplier",
    tableName: "quotation_suppliers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default QuotationSupplier;
