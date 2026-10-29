import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/DatabaseSource";

// Interface for attributes
export interface BackofficePermissionAttributes {
  id: string;
  module: string;
  permissions: string[];
  created_at?: Date;
  updated_at?: Date;
}

// Interface for creation attributes (optional fields)
export interface BackofficePermissionCreationAttributes
  extends Partial<BackofficePermissionAttributes> {}

// Model class
export class BackofficePermission extends Model<
  BackofficePermissionAttributes,
  BackofficePermissionCreationAttributes
> implements BackofficePermissionAttributes {
  public id!: string;
  public module!: string;
  public permissions!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize model
BackofficePermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSONB,
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
    tableName: "backoffice_permissions",
    timestamps: false,
  }
);

export default BackofficePermission;
