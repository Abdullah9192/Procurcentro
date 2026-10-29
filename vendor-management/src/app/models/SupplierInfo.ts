import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import SupplierIndustry from "./SupplierIndustry";

interface SupplierInfoAttributes {
  id: string;
  organization_id: string;
  user_id: string;

  company_logo: string | null;
  business_name: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;

  supplier_business_category_id: string | null;
  company_website: string | null;
  business_email: string | null;
  date_of_incorporation: Date | null;

  company_registration_no: string | null;
  tax_identification_no: string | null;
  vat_registration_no: string | null;
  

  bank_verification_no: string | null;

  certificate_of_incorporation: boolean;
  tax_clearance_certificate: boolean;
  vat_registration: boolean;
  audited_accounts: boolean;
  financial_capability: boolean;
  banking_details: boolean;

  created_at: Date;
  updated_at: Date;
}

type SupplierInfoCreationAttributes = Optional<
  SupplierInfoAttributes,
  | "id"
  | "created_at"
  | "updated_at"
  | "company_logo"
  | "business_name"
  | "country"
  | "state"
  | "city"
  | "address"
  | "latitude"
  | "longitude"
  | "supplier_business_category_id"
  | "company_website"
  | "business_email"
  | "company_registration_no"
  | "vat_registration_no"
  | "tax_identification_no"
  | "date_of_incorporation"
  | "bank_verification_no"
  | "certificate_of_incorporation"
  | "tax_clearance_certificate"
  | "vat_registration"
  | "audited_accounts"
  | "financial_capability"
  | "banking_details"
>;

class SupplierInfo
  extends Model<SupplierInfoAttributes, SupplierInfoCreationAttributes>
  implements SupplierInfoAttributes
{
  public id!: string;
  public organization_id!: string;
  public user_id!: string;

  public company_logo!: string | null;
  public business_name!: string | null;
  public country!: string | null;
  public state!: string | null;
  public city!: string | null;
  public address!: string | null;
  public latitude!: string | null;
  public longitude!: string | null;

  public supplier_business_category_id!: string | null;
  public company_website!: string | null;
  public business_email!: string | null;

  public company_registration_no!: string | null;
  public vat_registration_no!: string | null;
  public tax_identification_no!: string | null;

  public date_of_incorporation!: Date | null;
  public bank_verification_no!: string | null;

  public certificate_of_incorporation!: boolean;
  public tax_clearance_certificate!: boolean;
  public vat_registration!: boolean;
  public audited_accounts!: boolean;
  public financial_capability!: boolean;
  public banking_details!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public supplier_industry?: SupplierIndustry
}

SupplierInfo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    company_logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_name: {
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
    supplier_business_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    company_website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    business_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_registration_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vat_registration_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tax_identification_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_of_incorporation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bank_verification_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    certificate_of_incorporation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tax_clearance_certificate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    vat_registration: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    audited_accounts: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    financial_capability: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    banking_details: {
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
    tableName: "supplier_infos",
    modelName: "SupplierInfo",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupplierInfo;
