import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
} from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface InvoiceAttributes {
  id: string;
  invoice_id: string;
  purchase_order_id: string;
  order_id?: string | null;
  quotation_id: string;
  quote_id?: string | null;
  requisition_id: string;
  request_id?: string | null;
  organization_id: string;
  subsidiary_id?: string | null;
  subsidiary_branch_id?: string | null;
  branch_department_id?: string | null;
  status: string;
  selected_supplier_id: string;
  created_by: string;
  last_action_by?: string | null;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface InvoiceCreationAttributes
  extends Optional<
    InvoiceAttributes,
    | "id"
    | "order_id"
    | "quote_id"
    | "request_id"
    | "subsidiary_id"
    | "subsidiary_branch_id"
    | "branch_department_id"
    | "last_action_by"
    | "notes"
    | "created_at"
    | "updated_at"
  > {}

class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  public id!: string;
  public invoice_id!: string;
  public purchase_order_id!: string;
  public order_id!: string | null;
  public quotation_id!: string;
  public quote_id!: string | null;
  public requisition_id!: string;
  public request_id!: string | null;
  public organization_id!: string;
  public subsidiary_id!: string | null;
  public subsidiary_branch_id!: string | null;
  public branch_department_id!: string | null;
  public status!: string;
  public selected_supplier_id!: string;
  public created_by!: string;
  public last_action_by!: string | null;
  public notes!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoice_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purchase_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: true, // made nullable
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quote_id: {
      type: DataTypes.STRING,
      allowNull: true, // made nullable
    },
    requisition_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    request_id: {
      type: DataTypes.STRING,
      allowNull: true, // made nullable
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    selected_supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    last_action_by: {
      type: DataTypes.UUID,
      allowNull: true,
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
    modelName: "Invoice",
    tableName: "invoices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Invoice;
