import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource'; // Your sequelize instance

interface SupplierLitigationAttributes {
  id: string;
  organization_id: string;
  user_id: string;

  client_performance_discussion: boolean;
  pending_legal_actions: boolean;
  professional_misconduct: boolean;
  insolvency_or_bankruptcy: boolean;
  tax_or_pension_arrears: boolean;

  declaration_certified: boolean;

  created_at: Date;
  updated_at: Date;
}

type SupplierLitigationCreationAttributes = Optional<
  SupplierLitigationAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'client_performance_discussion'
  | 'pending_legal_actions'
  | 'professional_misconduct'
  | 'insolvency_or_bankruptcy'
  | 'tax_or_pension_arrears'
  | 'declaration_certified'
>;

class SupplierLitigation extends Model<
  SupplierLitigationAttributes,
  SupplierLitigationCreationAttributes
> {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;

  public client_performance_discussion!: boolean;
  public pending_legal_actions!: boolean;
  public professional_misconduct!: boolean;
  public insolvency_or_bankruptcy!: boolean;
  public tax_or_pension_arrears!: boolean;

  public declaration_certified!: boolean;

  public created_at!: Date;
  public updated_at!: Date;
}

SupplierLitigation.init(
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
    client_performance_discussion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pending_legal_actions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    professional_misconduct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    insolvency_or_bankruptcy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tax_or_pension_arrears: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    declaration_certified: {
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
    tableName: 'supplier_litigations',
    modelName: 'SupplierLitigation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at', 
  }
);


// Export
export default SupplierLitigation;
