import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import { SubscriptionPlan } from './Subscription'; // reuse same enum for consistency

// ---- ATTRIBUTES INTERFACE ----
interface TransactionHistoryAttributes {
  id: string;
  trans_id: string;
  amount: number;
  date: Date;
  billing_cycle: string;
  subscription_plan: SubscriptionPlan;
  module: number;
  number_of_users: number;
  country: string;
  user_id: string;
  org_id: string;
  created_at?: Date;
  updated_at?: Date;
}

// ---- CREATION ATTRIBUTES ----
type TransactionHistoryCreationAttributes = Optional<
  TransactionHistoryAttributes,
  'id' | 'created_at' | 'updated_at'
>;

// ---- MODEL DEFINITION ----
class TransactionHistory
  extends Model<TransactionHistoryAttributes, TransactionHistoryCreationAttributes>
  implements TransactionHistoryAttributes
{
  public id!: string;
  public trans_id!: string;
  public amount!: number;
  public date!: Date;
  public billing_cycle!: string;
  public subscription_plan!: SubscriptionPlan;
  public module!: number;
  public number_of_users!: number;
  public country!: string;
  public user_id!: string;
  public org_id!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ---- INIT MODEL ----
TransactionHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trans_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    billing_cycle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subscription_plan: {
      type: DataTypes.ENUM(...Object.values(SubscriptionPlan)),
      allowNull: false,
    },
    module: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number_of_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    modelName: 'TransactionHistory',
    tableName: 'transaction_histories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default TransactionHistory;
