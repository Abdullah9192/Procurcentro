import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/DatabaseSource";

// Interface for attributes
export interface BackofficeRoleAttributes {
  id: string;
  role: string;
  permissions?: string[];
  created_at?: Date;
  updated_at?: Date;
}

// Interface for creation attributes (optional fields)
export interface BackofficeRoleCreationAttributes
  extends Partial<BackofficeRoleAttributes> {}

// Model class
export class BackofficeRole extends Model<
  BackofficeRoleAttributes,
  BackofficeRoleCreationAttributes
> implements BackofficeRoleAttributes {
  public id!: string;
  public role!: string;
  public permissions!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize
BackofficeRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
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
    sequelize,
    tableName: "backoffice_roles",
    timestamps: false,
  }
);

export default BackofficeRole;
