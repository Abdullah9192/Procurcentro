import {
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import Organization from "./Organization";
import SubsidiaryBranch from "./SubsidiaryBranch";
import BranchDepartment from "./BranchDepartment";

interface SubsidiaryAttributes {
  id: string;
  subsidiary_name: string;
  email: string;
  address: string;
  latitude?: string;
  longitude?: string;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type SubsidiaryCreationAttributes = Optional<
  SubsidiaryAttributes,
  "id" | "latitude" | "longitude" | "is_active" | "created_at" | "updated_at"
>;

class Subsidiary
  extends Model<SubsidiaryAttributes, SubsidiaryCreationAttributes>
  implements SubsidiaryAttributes {
  public id!: string;
  public subsidiary_name!: string;
  public email!: string;
  public address!: string;
  public latitude?: string;
  public longitude?: string;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association accessors
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;
  public getBranches!: HasManyGetAssociationsMixin<SubsidiaryBranch>;
  public getDepartments!: HasManyGetAssociationsMixin<BranchDepartment>;

  public static associations: {
    organization: Association<Subsidiary, Organization>;
    branches: Association<Subsidiary, SubsidiaryBranch>;
    departments: Association<Subsidiary, BranchDepartment>;
  };
}

Subsidiary.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subsidiary_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: "Subsidiary",
    tableName: "subsidiaries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["subsidiary_name", "organization_id"],
      },
    ],
  }
);
export default Subsidiary;
