import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface QuotationNegotiationAttributes {
  id: string;
  quotation_supplier_id: string;
  quotation_id: string;
  supplier_id: string;
  organization_id: string;
  offered_price?: number | null;
  offered_delivery_date?: Date | null;
  offered_delivery_days?: number | null;
  offered_warranty?: string | null;
  offered_notes?: string | null;
  attachments?: Record<string, any>[] | null;
  initiated_by: "admin" | "supplier";
  status: "pending" | "accepted" | "rejected" | "revision";
  created_at?: Date;
  updated_at?: Date;
}

type QuotationNegotiationCreationAttributes = Optional<
  QuotationNegotiationAttributes,
  | "id"
  | "offered_price"
  | "offered_delivery_date"
  | "offered_delivery_days"
  | "offered_warranty"
  | "offered_notes"
  | "attachments"
  | "created_at"
  | "updated_at"
>;

class QuotationNegotiation
  extends Model<QuotationNegotiationAttributes, QuotationNegotiationCreationAttributes>
  implements QuotationNegotiationAttributes
{
  public id!: string;
  public quotation_supplier_id!: string;
  public quotation_id!: string;
  public supplier_id!: string;
  public organization_id!: string;
  public offered_price?: number | null;
  public offered_delivery_date?: Date | null;
  public offered_delivery_days?: number | null;
  public offered_warranty?: string | null;
  public offered_notes?: string | null;
  public attachments?: Record<string, any>[] | null;
  public initiated_by!: "admin" | "supplier";
  public status!: "pending" | "accepted" | "rejected" | "revision";
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

QuotationNegotiation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    quotation_supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    offered_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    offered_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    offered_delivery_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    offered_warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    offered_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    initiated_by: {
      type: DataTypes.ENUM("admin", "supplier"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected", "revision"),
      allowNull: false,
      defaultValue: "pending",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize: AppDataSource,
    modelName: "QuotationNegotiation",
    tableName: "quotation_negotiations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default QuotationNegotiation;
