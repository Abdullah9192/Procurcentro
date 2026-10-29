// model/Budget.ts
import {
  DataTypes,
  Model,
  Optional,
  HasManyGetAssociationsMixin,
  Association,
} from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

import BudgetItem from "./BudgetItem";
import BudgetAttachment from "./BudgetAttachment";

interface BudgetAttributes {
  id: string;
  name: string;
  org_category_id: string;
  approval_workflow_id: string;
  organization_id: string;
  org_currency_id: string;
  budget_cycle: string;
  duration: string;
  start_date: Date;
  end_date: Date;
  notes?: string;
  status?:
    | "draft"
    | "in_revision"
    | "pending_approval"
    | "approved"
    | "completed"
    | "rejected";
  subsidiary_id?: string;
  subsidiary_branch_id?: string;
  branch_department_id?: string;
  created_by?: string;
  last_action_by?: string;
  total_budget: number;
  spent_budget_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

interface BudgetCreationAttributes
  extends Optional<
    BudgetAttributes,
    | "id"
    | "notes"
    | "status"
    | "subsidiary_id"
    | "subsidiary_branch_id"
    | "branch_department_id"
    | "last_action_by"
    | "created_at"
    | "updated_at"
    | "total_budget"
    | "spent_budget_amount"
  > {}

class Budget
  extends Model<BudgetAttributes, BudgetCreationAttributes>
  implements BudgetAttributes
{
  public id!: string;
  public name!: string;
  public org_category_id!: string;
  public approval_workflow_id!: string;
  public organization_id!: string;
  public org_currency_id!: string;
  public budget_cycle!: string;
  public duration!: string;
  public start_date!: Date;
  public end_date!: Date;
  public notes?: string;
  public status?:
    | "draft"
    | "in_revision"
    | "pending_approval"
    | "approved"
    | "completed"
    | "rejected";
  public subsidiary_id?: string;
  public subsidiary_branch_id?: string;
  public branch_department_id?: string;
  public created_by?: string;
  public last_action_by?: string;
  public total_budget!: number;
  public spent_budget_amount!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getBudget_items!: HasManyGetAssociationsMixin<BudgetItem>;
  public getAttachments!: HasManyGetAssociationsMixin<BudgetAttachment>;

  public static associations: {
    budget_items: Association<Budget, BudgetItem>;
    attachments: Association<Budget, BudgetAttachment>;
  };
}

Budget.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approval_workflow_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    org_currency_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_cycle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "in_revision",
        "pending_approval",
        "approved",
        "completed",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "draft",
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_action_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    total_budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    spent_budget_amount: {
      type: DataTypes.DECIMAL(10, 2),
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
    modelName: "Budget",
    tableName: "budgets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Relations will be added in ModelAssociations.ts

export default Budget;
