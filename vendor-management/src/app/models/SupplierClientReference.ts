import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface SupplierClientReferenceAttributes {
  id: string;
  organization_id: string;
  user_id: string;

  business_name: string | null;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  contact_name: string | null;
  contact_email: string | null;
  project_description: string | null;

  created_at: Date;
  updated_at: Date;
}

type SupplierClientReferenceCreationAttributes = Optional<
  SupplierClientReferenceAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'business_name'
  | 'location'
  | 'latitude'
  | 'longitude'
  | 'contract_start_date'
  | 'contract_end_date'
  | 'contact_name'
  | 'contact_email'
  | 'project_description'
>;

class SupplierClientReference extends Model<
  SupplierClientReferenceAttributes,
  SupplierClientReferenceCreationAttributes
> {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;

  public business_name!: string | null;
  public location!: string | null;
  public latitude!: string | null;
  public longitude!: string | null;
  public contract_start_date!: string | null;
  public contract_end_date!: string | null;
  public contact_name!: string | null;
  public contact_email!: string | null;
  public project_description!: string | null;

  public created_at!: Date;
  public updated_at!: Date;
}

SupplierClientReference.init(
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
    business_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
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
    contract_start_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contract_end_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    project_description: {
      type: DataTypes.TEXT,
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
    tableName: 'supplier_client_references',
    modelName: 'SupplierClientReference',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SupplierClientReference;
