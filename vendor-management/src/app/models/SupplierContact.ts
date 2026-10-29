import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource'; // Your sequelize instance

interface SupplierContactAttributes {
  id: string;
  organization_id: string;
  user_id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_phone_code: string | null;
  contact_job_title: string | null;
  national_identity_number: string;
  is_primary: boolean;

  created_at: Date;
  updated_at: Date;
}

type SupplierContactCreationAttributes = Optional<
  SupplierContactAttributes,
  'id' | 'created_at' | 'updated_at' | 'contact_name' | 'contact_email' | 'contact_phone' | 'contact_phone_code' | 'contact_job_title' | 'is_primary'
>;

class SupplierContact extends Model<
  SupplierContactAttributes,
  SupplierContactCreationAttributes
> {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;

  public contact_name!: string | null;
  public contact_email!: string | null;
  public contact_phone!: string | null;
  public contact_phone_code!: string | null;
  public contact_job_title!: string | null;

  public national_identity_number!: string;
  public is_primary!: boolean;

  public created_at!: Date;
  public updated_at!: Date;

}

SupplierContact.init(
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
    contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_phone_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_job_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    national_identity_number: {
      type: DataTypes.STRING,
      defaultValue: '',
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
    tableName: 'supplier_contacts',
    modelName: 'SupplierContact',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at', 
  }
);


// Export
export default SupplierContact;
