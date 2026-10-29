import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/DatabaseSource";

export interface BackofficeCreditAttributes {
  id: string;
  document: string;
  credit: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BackofficeCreditCreationAttributes
  extends Partial<BackofficeCreditAttributes> {}

export class BackofficeCredit extends Model<
  BackofficeCreditAttributes,
  BackofficeCreditCreationAttributes
> implements BackofficeCreditAttributes {
  public id!: string;
  public document!: string;
  public credit!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

BackofficeCredit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    credit: {
      type: DataTypes.INTEGER,
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
    sequelize,
    tableName: "backoffice_credits",
    timestamps: false,
  }
);

export default BackofficeCredit;
