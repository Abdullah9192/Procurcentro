import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface BudgetItemAttributes {
  id: string;
  budget_id: string;
  item_name: string;
  org_sub_category_id: string;
  amount: number;
  warning_limit: number;
  allow_exceed_budget: boolean;
  limit_exceed_amount?: number;
  spent_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

type BudgetItemCreationAttributes = Optional<
  BudgetItemAttributes,
  | "id"
  | "item_name"
  | "created_at"
  | "updated_at"
  | "limit_exceed_amount"
  | "spent_amount"
>;

class BudgetItem
  extends Model<BudgetItemAttributes, BudgetItemCreationAttributes>
  implements BudgetItemAttributes
{
  public id!: string;
  public budget_id!: string;
  public item_name!: string;
  public org_sub_category_id!: string;
  public amount!: number;
  public warning_limit!: number;
  public allow_exceed_budget!: boolean;
  public limit_exceed_amount?: number;
  public spent_amount!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BudgetItem.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    org_sub_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    warning_limit: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    allow_exceed_budget: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    limit_exceed_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    spent_amount: {
      type: DataTypes.DECIMAL(15, 2),
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
    tableName: "budget_items",
    modelName: "BudgetItem",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default BudgetItem;
