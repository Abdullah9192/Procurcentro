import { Model, DataTypes, Optional } from 'sequelize';
import  AppDataSource  from '../../config/DatabaseSource'; // Adjust path as needed

interface OrganizationAttributes {
  id: string;
  name: string;
  logo: string | null;
  company_url: string | null;
  primary_email: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  zip_code: string | null;
  primary_contact_number: string | null;
  stepper: number;
  is_profile: boolean;
  is_setting: boolean;
  is_permission: boolean;
  is_approval: boolean;
  is_supplier: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
  public id!: string;
  public name!: string;
  public logo!: string | null;
  public company_url!: string | null;
  public primary_email!: string | null;
  public country!: string | null;
  public state!: string | null;
  public city!: string | null;
  public address!: string | null;
  public latitude!: string | null;
  public longitude!: string | null;
  public zip_code!: string | null;
  public primary_contact_number!: string | null;
  public stepper!: number;
  public is_profile!: boolean;
  public is_setting!: boolean;
  public is_permission!: boolean;
  public is_approval!: boolean;
  public is_supplier!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stepper: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_profile: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_setting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_permission: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_supplier: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    modelName: 'Organization',
    tableName: 'organizations',
    timestamps: true,
    paranoid: false, // Set to true if you want soft deletion
  }
);

export default Organization;