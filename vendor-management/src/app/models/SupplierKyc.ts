import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface SupplierKycAttributes {
  id: string;
  organization_id: string;
  user_id: string;

  nsitf_cert_number: string | null;
  itf_cert_number: string | null;
  pencom_cert_number: string | null;
  interim_reg_report_number: string | null;
  proof_of_address_number: string | null;
  tax_cert_number: string | null;

  moa_number: string | null;
  upstream_cert_number: string | null;

  created_at: Date;
  updated_at: Date;
}

type SupplierKycCreationAttributes = Optional<
  SupplierKycAttributes,
  | 'id'
  | 'nsitf_cert_number'
  | 'itf_cert_number'
  | 'pencom_cert_number'
  | 'interim_reg_report_number'
  | 'proof_of_address_number'
  | 'tax_cert_number'
  | 'moa_number'
  | 'upstream_cert_number'
  | 'created_at'
  | 'updated_at'
>;

class SupplierKyc extends Model<
  SupplierKycAttributes,
  SupplierKycCreationAttributes
> {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;

  public nsitf_cert_number!: string | null;
  public itf_cert_number!: string | null;
  public pencom_cert_number!: string | null;
  public interim_reg_report_number!: string | null;
  public proof_of_address_number!: string | null;
  public tax_cert_number!: string | null;
  public moa_number!: string | null;
  public upstream_cert_number!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SupplierKyc.init(
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
    nsitf_cert_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    itf_cert_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pencom_cert_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interim_reg_report_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proof_of_address_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tax_cert_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    moa_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    upstream_cert_number: {
      type: DataTypes.STRING,
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
    tableName: 'supplier_kycs',
    modelName: 'SupplierKyc',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SupplierKyc;
