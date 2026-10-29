import { DataTypes, Model, Optional, Association, HasManyGetAssociationsMixin } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import ClauseLibraryVariation from "./ClauseLibraryVariation";

interface ClauseLibraryAttributes {
  id: string;
  organization_id: string;
  clause_type: string;
  clause_name: string;
  date_modification?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

type ClauseLibraryCreationAttributes = Optional<
  ClauseLibraryAttributes,
  "id" | "date_modification" | "created_at" | "updated_at"
>;

class ClauseLibrary
  extends Model<ClauseLibraryAttributes, ClauseLibraryCreationAttributes>
  implements ClauseLibraryAttributes
{
  public id!: string;
  public organization_id!: string;
  public clause_type!: string;
  public clause_name!: string;
  public date_modification?: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixins
  public getVariations!: HasManyGetAssociationsMixin<ClauseLibraryVariation>;

  public static associations: {
    variations: Association<ClauseLibrary, ClauseLibraryVariation>;
  };
}

ClauseLibrary.init(
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
    clause_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clause_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_modification: {
      type: DataTypes.DATE,
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
    tableName: "clause_libraries",
    modelName: "ClauseLibrary",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ClauseLibrary;
