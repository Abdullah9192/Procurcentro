import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import QuotationScoring from "./QuotationScoring";

interface QuotationScoringConfigurationAttributes {
  id: string;
  quotation_scoring_id: string;
  criteria: string;
  weight: number;
  created_at: Date;
  updated_at: Date;
}
export type { QuotationScoringConfigurationAttributes };
interface QuotationScoringConfigurationCreationAttributes
  extends Optional<QuotationScoringConfigurationAttributes, "id" | "created_at" | "updated_at"> {}

class QuotationScoringConfiguration
  extends Model<
    QuotationScoringConfigurationAttributes,
    QuotationScoringConfigurationCreationAttributes
  >
  implements QuotationScoringConfigurationAttributes {
  public id!: string;
  public quotation_scoring_id!: string;
  public criteria!: string;
  public weight!: number;
  public created_at!: Date;
  public updated_at!: Date;

  public readonly quotation_scoring?: QuotationScoring;
}

QuotationScoringConfiguration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quotation_scoring_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "quotation_scorings", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    criteria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight: {
      type: DataTypes.FLOAT,
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
    modelName: "QuotationScoringConfiguration",
    tableName: "quotation_scoring_configurations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["quotation_scoring_id"], name: "quotation_scoring_configurations_scoring_id" },
    ],
  }
);

export default QuotationScoringConfiguration;
