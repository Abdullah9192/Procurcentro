import {
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToGetAssociationMixin,
} from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import ClauseLibrary from "./ClauseLibrary";

interface ClauseLibraryVariationAttributes {
  id: string;
  organization_id: string;
  clause_library_id: string;
  title: string;
  language: string;
  is_primary: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type ClauseLibraryVariationCreationAttributes = Optional<
  ClauseLibraryVariationAttributes,
  "id" | "is_primary" | "created_at" | "updated_at"
>;

class ClauseLibraryVariation
  extends Model<
    ClauseLibraryVariationAttributes,
    ClauseLibraryVariationCreationAttributes
  >
  implements ClauseLibraryVariationAttributes
{
  public id!: string;
  public organization_id!: string;
  public clause_library_id!: string;
  public title!: string;
  public language!: string;
  public is_primary!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixin
  public getClauseLibrary!: BelongsToGetAssociationMixin<ClauseLibrary>;

  public static associations: {
    clauseLibrary: Association<ClauseLibraryVariation, ClauseLibrary>;
  };
}

ClauseLibraryVariation.init(
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
    clause_library_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    is_primary: {
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
    tableName: "clause_library_variations",
    modelName: "ClauseLibraryVariation",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


export default ClauseLibraryVariation;
