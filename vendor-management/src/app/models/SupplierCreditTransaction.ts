import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/DatabaseSource";

export type TransactionType = "purchase" | "debit" | "refund" | "adjustment";
export type PaymentStatus = "pending" | "successful" | "failed";

interface SupplierCreditTransactionAttributes {
  id: string;
  transaction_id: string;
  organization_id: string;
  user_id?: string | null;
  document_id?: string | null;
  type: TransactionType;
  credits: number;
  credits_purchased?: number | null; // ✅ explicitly add this
  amount: number; // total NGN
  amount_paid?: number | null; // ✅ can be used synonymously
  payment_reference?: string | null;
  payment_method?: string | null;
  status: PaymentStatus;
  description?: string | null;
  balance_after: number;
  metadata?: object | null; // ✅ for Paystack response
  created_at?: Date;
  updated_at?: Date;
}

interface SupplierCreditTransactionCreationAttributes
  extends Optional<
    SupplierCreditTransactionAttributes,
    | "id"
    | "user_id"
    | "document_id"
    | "description"
    | "payment_reference"
    | "payment_method"
    | "credits_purchased"
    | "amount_paid"
    | "metadata"
  > { }

class SupplierCreditTransaction
  extends Model<
    SupplierCreditTransactionAttributes,
    SupplierCreditTransactionCreationAttributes
  >
  implements SupplierCreditTransactionAttributes {
  public id!: string;
  public transaction_id!: string;
  public organization_id!: string;
  public user_id!: string | null;
  public document_id!: string | null;
  public type!: TransactionType;
  public credits!: number;
  public credits_purchased!: number | null;
  public amount!: number;
  public amount_paid!: number | null;
  public payment_reference!: string | null;
  public payment_method!: string | null;
  public status!: PaymentStatus;
  public description!: string | null;
  public balance_after!: number;
  public metadata!: object | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SupplierCreditTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    document_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("purchase", "debit", "refund", "adjustment"),
      allowNull: false,
    },
    credits: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    credits_purchased: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Number of credits bought in purchase",
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Total amount (NGN)",
    },
    amount_paid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Amount paid by user (NGN)",
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Paystack reference ID",
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "paystack",
    },
    status: {
      type: DataTypes.ENUM("pending", "successful", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    balance_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Stores Paystack response or webhook data",
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
    sequelize,
    tableName: "supplier_credit_transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupplierCreditTransaction;
