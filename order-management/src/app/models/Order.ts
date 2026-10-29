import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import OrderSupplierItem from "./OrderSupplierItem";
import OrderComment from "./OrderComment";

export interface OrderAttributes {
  id: string;
  order_gen_id: string;
  quotation_id: string;
  quote_id: string;
  requisition_id?: string;
  request_id?: string;
  organization_id: string;
  subsidiary_id?: string | null;
  subsidiary_branch_id?: string | null;
  branch_department_id?: string | null;
  admin_status:
  | "pending_approval"
  | "not_fulfilled"
  | "delivered"
  | "sent"
  | "in_revision"
  | "approved"
  | "completed"
  | "rejected"
  | "supplier_accepted"
  | "supplier_rejected"
  | "signed"
  | "draft";
  supplier_status?:
  | "pending"
  | "accepted"
  | "rejected"
  | "in_fulfilment"
  | "signed"
  | "delivered"
  | "partially_delivered"
  | null;
  receiving_status?:
  | "awaiting_receipt"
  | "pending"
  | "received"
  | "rejected"
  | "partially_received"
  | "awaiting_confirmation"
  | null;
  invoice_admin_status?:
  | "pending_invoice"
  | "rejected"
  | "paid"
  | "partially_paid"
  | "unmatched_invoice"
  | "pending_payment"
  | null;
  invoice_supplier_status?:
  | "partially_received_invoice_pending"
  | "fully_invoiced_payment_pending"
  | "fully_invoiced_paid"
  | "partially_invoiced_paid"
  | "fully_received_invoice_pending"
  | "partially_invoiced_payment_pending"
  | null;
  selected_supplier_id?: string | null;
  created_by: string;
  last_action_by?: string | null;
  notes?: string | null;
  total_order_amount?: number | null;
  total_bid_amount?: number | null;
  warranty?: string | null;
  shipping_terms?: string | null;
  payment_terms?: string | null;
  receiving_location: string;
  supplier_delivery_date?: Date | null;
  attachments?: object | null;
  docs?: object | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    | "id"
    | "subsidiary_id"
    | "subsidiary_branch_id"
    | "branch_department_id"
    | "supplier_status"
    | "receiving_status"
    | "invoice_admin_status"
    | "invoice_supplier_status"
    | "selected_supplier_id"
    | "last_action_by"
    | "notes"
    | "total_order_amount"
    | "total_bid_amount"
    | "warranty"
    | "shipping_terms"
    | "payment_terms"
    | "supplier_delivery_date"
    | "attachments"
    | "docs"
    | "created_at"
    | "updated_at"
  > { }

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes {
  public id!: string;
  public order_gen_id!: string;
  public quotation_id!: string;
  public quote_id!: string;
  public requisition_id?: string;
  public request_id?: string;
  public organization_id!: string;
  public subsidiary_id!: string | null;
  public subsidiary_branch_id!: string | null;
  public branch_department_id!: string | null;
  public admin_status!: OrderAttributes["admin_status"];
  public supplier_status!: OrderAttributes["supplier_status"];
  public receiving_status!: OrderAttributes["receiving_status"];
  public invoice_admin_status!: OrderAttributes["invoice_admin_status"];
  public invoice_supplier_status!: OrderAttributes["invoice_supplier_status"];
  public selected_supplier_id!: string | null;
  public created_by!: string;
  public last_action_by!: string | null;
  public notes!: string | null;
  public total_order_amount!: number | null;
  public total_bid_amount!: number | null;
  public warranty!: string | null;
  public shipping_terms!: string | null;
  public payment_terms!: string | null;
  public receiving_location!: string;
  public supplier_delivery_date!: Date | null;
  public attachments!: object | null;
  public docs!: object | null;
  public created_at!: Date;
  public updated_at!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_gen_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    admin_status: {
      type: DataTypes.ENUM(
        "pending_approval",
        "not_fulfilled",
        "delivered",
        "sent",
        "in_revision",
        "approved",
        "completed",
        "rejected",
        "supplier_accepted",
        "supplier_rejected",
        "signed",
        "draft"
      ),
      allowNull: false,
      defaultValue: "draft",
    },
    supplier_status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "rejected",
        "in_fulfilment",
        "signed",
        "delivered",
        "partially_delivered"
      ),
      allowNull: true,
    },
    receiving_status: {
      type: DataTypes.ENUM(
        "awaiting_receipt",
        "pending",
        "received",
        "rejected",
        "partially_received",
        "awaiting_confirmation"
      ),
      allowNull: true,
    },
    invoice_admin_status: {
      type: DataTypes.ENUM(
        "pending_invoice",
        "rejected",
        "paid",
        "partially_paid",
        "unmatched_invoice",
        "pending_payment"
      ),
      allowNull: true,
    },
    invoice_supplier_status: {
      type: DataTypes.ENUM(
        "partially_received_invoice_pending",
        "fully_invoiced_payment_pending",
        "fully_invoiced_paid",
        "partially_invoiced_paid",
        "fully_received_invoice_pending",
        "partially_invoiced_payment_pending"
      ),
      allowNull: true,
    },
    selected_supplier_id: {
      type: DataTypes.UUID,
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    total_bid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipping_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    receiving_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplier_delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    docs: {
      type: DataTypes.JSONB,
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
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Order;
