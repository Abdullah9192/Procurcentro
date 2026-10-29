import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export interface OrderSupplierItemAttributes {
  id: string;
  order_id: string;
  quotation_id?: string | null;
  requisition_id?: string | null;
  invoice_id?: string | null;
  item_name?: string | null;
  org_currency_id?: string | null;
  budget_id: string;
  budget_item_id: string;
  unit_price?: number | null;
  discount_percentage?: number | null;
  delivery_fees?: number | null;
  tax_percentage?: number | null;
  total_amount?: number | null;
  organization_id: string;
  org_category_id?: string | null;
  ordered_quantity?: number | null;
  quantity_delivered?: number | null;
  pending_delivery_quantity?: number | null;
  admin_receive?: number | null;
  admin_rejected?: number | null;
  rejection_message?: string | null;
  delivery_status?: "pending" | "shipped" | "delivered" | "delayed" | null;
  receiving_status?: "received" | "partially_received" | "rejected" | null;
  deliver_at?: Date | null;
  received_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderSupplierItemCreationAttributes
  extends Optional<
    OrderSupplierItemAttributes,
    | "id"
    | "quotation_id"
    | "requisition_id"
    | "invoice_id"
    | "item_name"
    | "org_currency_id"
    | "unit_price"
    | "discount_percentage"
    | "delivery_fees"
    | "tax_percentage"
    | "total_amount"
    | "org_category_id"
    | "ordered_quantity"
    | "quantity_delivered"
    | "pending_delivery_quantity"
    | "admin_receive"
    | "admin_rejected"
    | "rejection_message"
    | "delivery_status"
    | "receiving_status"
    | "deliver_at"
    | "received_at"
    | "created_at"
    | "updated_at"
  > { }

class OrderSupplierItem
  extends Model<
    OrderSupplierItemAttributes,
    OrderSupplierItemCreationAttributes
  >
  implements OrderSupplierItemAttributes {
  public id!: string;
  public order_id!: string;
  public quotation_id!: string | null;
  public requisition_id!: string | null;
  public invoice_id!: string | null;
  public item_name!: string | null;
  public org_currency_id!: string | null;
  public budget_id!: string;
  public budget_item_id!: string;
  public unit_price!: number | null;
  public discount_percentage!: number | null;
  public delivery_fees!: number | null;
  public tax_percentage!: number | null;
  public total_amount!: number | null;
  public organization_id!: string;
  public org_category_id!: string | null;
  public ordered_quantity!: number | null;
  public quantity_delivered!: number | null;
  public pending_delivery_quantity!: number | null;
  public admin_receive!: number | null;
  public admin_rejected!: number | null;
  public rejection_message!: string | null;
  public delivery_status!:
    | "pending"
    | "shipped"
    | "delivered"
    | "delayed"
    | null;
  public receiving_status!:
    | "received"
    | "partially_received"
    | "rejected"
    | null;
  public deliver_at!: Date | null;
  public received_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
}

OrderSupplierItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    requisition_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    invoice_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    org_currency_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    discount_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    delivery_fees: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tax_percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ordered_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity_delivered: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pending_delivery_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_receive: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_rejected: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rejection_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    delivery_status: {
      type: DataTypes.ENUM("pending", "shipped", "delivered", "delayed"),
      allowNull: true,
      defaultValue: "pending",
    },
    receiving_status: {
      type: DataTypes.ENUM("received", "partially_received", "rejected"),
      allowNull: true,
    },
    deliver_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    received_at: {
      type: DataTypes.DATE,
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
    tableName: "order_supplier_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["order_id"] },
      { fields: ["organization_id"] },
    ],
  }
);

export default OrderSupplierItem;
