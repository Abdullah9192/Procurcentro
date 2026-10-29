import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource'; // Your sequelize instance

interface SupplierBankInfoAttributes {
  id: string;
  organization_id: string;
  user_id: string;
  currency: string | null;
  account_type: string | null;
  bank: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  iban: string | null;
  swift_code: string | null;
  sort_code: string | null;
  bank_branch_name: string | null;
  is_allowed: boolean;
  created_at: Date;
  updated_at: Date;
}

type SupplierBankInfoCreationAttributes = Optional<
  SupplierBankInfoAttributes,
  | 'id'
  | 'currency'
  | 'account_type'
  | 'bank'
  | 'bank_account_name'
  | 'bank_account_number'
  | 'iban'
  | 'swift_code'
  | 'sort_code'
  | 'bank_branch_name'
  | 'is_allowed'
  | 'created_at'
  | 'updated_at'
>;

class SupplierBankInfo extends Model<
  SupplierBankInfoAttributes,
  SupplierBankInfoCreationAttributes
> {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;

  public currency!: string | null;
  public account_type!: string | null;
  public bank!: string | null;
  public bank_account_name!: string | null;
  public bank_account_number!: string | null;
  public iban!: string | null;
  public swift_code!: string | null;
  public sort_code!: string | null;
  public bank_branch_name!: string | null;
  public is_allowed!: boolean;

  public created_at!: Date;
  public updated_at!: Date;
}

SupplierBankInfo.init(
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
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_account_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    swift_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sort_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bank_branch_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: 'supplier_bank_infos',
    modelName: 'SupplierBankInfo',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SupplierBankInfo;
