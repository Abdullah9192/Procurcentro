import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
interface OrderReceivingAttributes {
  id: string;
  order_id: string;
  order_gen_id?: string | null;
  quotation_id?: string | null;
  quote_id?: string | null;
  requisition_id?: string | null;
  request_id?: string | null;
  organization_id: string;
  currency?: string | null;
  supplier_id?: string | null;
  ship_to_user_id?: string | null;
  budget_id?: string;
  budget_item_id?: string;
  received_user_id?: string | null;
  grn_gen_id?: string | null;
  invoice_gen_id?: string | null;
  date_issued?: Date | null;
  delivery_date?: Date | null;
  sub_total?: number;
  vat?: number;
  shipping?: number;
  discount?: number;
  total_amount?: number;
  account_payable_price?: number;
  grn_link?: string | null;
  invoice_link?: string | null;
  order_link?: string | null;
  receipt_link?: string | null;
  order_status?: string | null;
  grn_status?: string | null;
  admin_invoice_status?:
  | "ready_for_invoice"
  | "invoiced"
  | "ready_for_billing"
  | null;
  supplier_invoice_status?:
  | "ready_for_invoice"
  | "invoiced"
  | "ready_for_billing"
  | null;
  invoice_requested?: boolean | null;
  payment_status?: string | null;
  grn_items?: object | null;
  invoice_items?: object | null;
  order_items?: object | null;
  invoice_reciept_id?: string | null;
  is_3way: boolean;
  is_paid: boolean;
  account_payable_date?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type OrderReceivingCreationAttributes = Optional<
  OrderReceivingAttributes,
  "id"
>;

export class OrderReceiving
  extends Model<OrderReceivingAttributes, OrderReceivingCreationAttributes>
  implements OrderReceivingAttributes {
  public id!: string;
  public order_id!: string;
  public order_gen_id!: string | null;
  public quotation_id!: string | null;
  public quote_id!: string | null;
  public requisition_id!: string | null;
  public request_id!: string | null;
  public organization_id!: string;
  public currency!: string | null;
  public supplier_id?: string;
  public ship_to_user_id!: string | null;
  public received_user_id!: string | null;
  public grn_gen_id!: string | null;
  public invoice_gen_id!: string | null;
  public date_issued!: Date | null;
  public delivery_date!: Date | null;
  public sub_total!: number;
  public vat!: number;
  public shipping!: number;
  public discount!: number;
  public total_amount!: number;
  public account_payable_price!: number;
  public grn_link!: string | null;
  public invoice_link!: string | null;
  public order_link!: string | null;
  public receipt_link!: string | null;
  public order_status!: string | null;
  public grn_status!: string | null;
  public admin_invoice_status!: "ready_for_invoice" | "invoiced" | "ready_for_billing" | null;
  public supplier_invoice_status!: "ready_for_invoice" | "invoiced" | "ready_for_billing" | null;
  public invoice_requested!: boolean | null;
  public payment_status!: string | null;
  public grn_items!: object | null;
  public invoice_items!: object | null;
  public order_items!: object | null;
  public invoice_reciept_id!: string | null;
  public is_3way!: boolean;
  public is_paid!: boolean;
  public account_payable_date!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderReceiving.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: { type: DataTypes.UUID, allowNull: false },
    order_gen_id: { type: DataTypes.STRING },
    quotation_id: { type: DataTypes.UUID },
    quote_id: { type: DataTypes.STRING },
    requisition_id: { type: DataTypes.UUID },
    request_id: { type: DataTypes.STRING },
    organization_id: { type: DataTypes.UUID, allowNull: false },
    currency: { type: DataTypes.STRING },
    supplier_id: { type: DataTypes.UUID, allowNull: true },
    ship_to_user_id: { type: DataTypes.UUID },
    received_user_id: { type: DataTypes.UUID },
    grn_gen_id: { type: DataTypes.STRING },
    invoice_gen_id: { type: DataTypes.STRING },
    date_issued: { type: DataTypes.DATE },
    delivery_date: { type: DataTypes.DATE },
    sub_total: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    vat: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    shipping: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    grn_link: { type: DataTypes.STRING },
    invoice_link: { type: DataTypes.STRING },
    order_link: { type: DataTypes.STRING },
    receipt_link: { type: DataTypes.STRING },
    order_status: { type: DataTypes.STRING },
    grn_status: { type: DataTypes.STRING },
    admin_invoice_status: { type: DataTypes.STRING },
    supplier_invoice_status: { type: DataTypes.STRING },
    invoice_requested: { type: DataTypes.BOOLEAN, defaultValue: false },
    payment_status: { type: DataTypes.STRING },
    grn_items: { type: DataTypes.JSON },
    invoice_items: { type: DataTypes.JSON },
    order_items: { type: DataTypes.JSON },
    invoice_reciept_id: { type: DataTypes.STRING },
    is_3way: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    account_payable_date: { type: DataTypes.STRING },
    account_payable_price: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize: AppDataSource,
    tableName: "order_receivings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default OrderReceiving;
