import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import QuotationScoringConfiguration from "./QuotationScoringConfiguration";

export interface QuotationItemScoringResultAttributes {
  id: string;
  quotation_item_id: string;
  quotation_supplier_id: string;
  scoring_configuration_id?: string | null;
  score: number;
  weight: number;
  final_score: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface QuotationItemScoringResultCreationAttributes
  extends Optional<
    QuotationItemScoringResultAttributes,
    "id" | "scoring_configuration_id" | "created_at" | "updated_at"
  > {}

class QuotationItemScoringResult
  extends Model<
    QuotationItemScoringResultAttributes,
    QuotationItemScoringResultCreationAttributes
  >
  implements QuotationItemScoringResultAttributes
{
  public id!: string;
  public quotation_item_id!: string;
  public quotation_supplier_id!: string;
  public scoring_configuration_id!: string | null;
  public score!: number;
  public weight!: number;
  public final_score!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public readonly scoring_config?: QuotationScoringConfiguration;
}

QuotationItemScoringResult.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quotation_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quotation_supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    scoring_configuration_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "quotation_scoring_configurations", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.0,
    },
    final_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
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
    modelName: "QuotationItemScoringResult",
    tableName: "quotation_item_scoring_results",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["scoring_configuration_id"],
        name: "quotation_item_scoring_results_scoring_config_id",
      },
    ],
  }
);

export default QuotationItemScoringResult;
