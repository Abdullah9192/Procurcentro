import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import QuotationScoringConfiguration from "./QuotationScoringConfiguration";

export type ScoringMethod = "Hybrid" | "Manual" | "Auto";
export type Visibility = "Private" | "Public";

interface QuotationScoringAttributes {
  id: string;
  organization_id: string;
  template_name: string;
  org_category_id: string | null;
  scoring_method: ScoringMethod;
  visibility: Visibility;
  restrict: boolean;
  created_at: Date;
  updated_at: Date;
}

interface QuotationScoringCreationAttributes
  extends Optional<
    QuotationScoringAttributes,
    | "id"
    | "org_category_id"
    | "visibility"
    | "created_at"
    | "updated_at"
    | "restrict"
  > {}

class QuotationScoring
  extends Model<QuotationScoringAttributes, QuotationScoringCreationAttributes>
  implements QuotationScoringAttributes
{
  public id!: string;
  public organization_id!: string;
  public template_name!: string;
  public org_category_id!: string | null;
  public scoring_method!: ScoringMethod;
  public visibility!: Visibility;
  public restrict!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  public readonly configurations?: QuotationScoringConfiguration[];
}

QuotationScoring.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    template_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    scoring_method: {
      type: DataTypes.ENUM("Hybrid", "Manual", "Auto"),
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM("Private", "Public"),
      allowNull: false,
      defaultValue: "Public",
    },
    restrict: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: "QuotationScoring",
    tableName: "quotation_scorings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["org_category_id"],
        name: "quotation_scorings_org_category_id",
      },
    ],
  }
);

export default QuotationScoring;
