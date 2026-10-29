import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface QuotationItemAttributes {
  id: string;
  quotation_id: string;
  quote_item_id: string;
  scoring_configuration_id?: string;
  item_name: string;
  org_category_id: string;
  budget_id: string;
  budget_item_id: string;
  quantity: number;
  use_type: "one_time" | "recurring";
  unit_price: number;
  org_currency_id: string;
  comment?: string | null;
  frequency?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  total_price: number;
  attachments?: any;
  created_at?: Date;
  updated_at?: Date;
}

type QuotationItemCreationAttributes = Optional<
  QuotationItemAttributes,
  | "id"
  | "comment"
  | "frequency"
  | "start_date"
  | "end_date"
  | "created_at"
  | "updated_at"
>;

class QuotationItem
  extends Model<QuotationItemAttributes, QuotationItemCreationAttributes>
  implements QuotationItemAttributes
{
  public id!: string;
  public quotation_id!: string;
  public quote_item_id!: string;
  public scoring_configuration_id?: string;
  public item_name!: string;
  public org_category_id!: string;
  public budget_id!: string;
  public budget_item_id!: string;
  public quantity!: number;
  public use_type!: "one_time" | "recurring";
  public unit_price!: number;
  public org_currency_id!: string;
  public comment?: string | null;
  public frequency?: string | null;
  public start_date?: Date | null;
  public end_date?: Date | null;
  public total_price!: number;
  public attachments?: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

QuotationItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quote_item_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quotation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    scoring_configuration_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    budget_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    use_type: {
      type: DataTypes.ENUM("one_time", "recurring"),
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    org_currency_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
    modelName: "QuotationItem",
    tableName: "quotation_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default QuotationItem;
