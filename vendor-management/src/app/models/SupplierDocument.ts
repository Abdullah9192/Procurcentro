import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface SupplierDocumentAttributes {
  id: string;
  organization_id: string;
  user_id: string;
  section: 'basic_info' | 'kyc_info' | 'contact_info';
  verified_type?: 'mono_docs' | 'admin' | null;
  section_id: string;
  document_name: string;
  section_number?: string | null;
  is_verified: boolean;
  file_url: string;
  status: 'pending' | 'verified' | 'rejected';
  admin_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string | null;
  verified_at?: Date | null;
  credits_used?: number;
  ai_checked?: boolean;
  ai_credits_used?: number;
  created_at?: Date;
  updated_at?: Date;
}

type SupplierDocumentCreationAttributes = Optional<
  SupplierDocumentAttributes,
  | 'id'
  | 'verified_by'
  | 'verified_at'
  | 'credits_used'
  | 'ai_checked'
  | 'ai_credits_used'
  | 'created_at'
  | 'updated_at'
>;

class SupplierDocument
  extends Model<SupplierDocumentAttributes, SupplierDocumentCreationAttributes>
  implements SupplierDocumentAttributes {
  public id!: string;
  public organization_id!: string;
  public user_id!: string;
  public section!: 'basic_info' | 'kyc_info' | 'contact_info';
  public verified_type?: 'mono_docs' | 'admin' | null;
  public section_id!: string;
  public document_name!: string;
  public section_number?: string;
  public is_verified!: boolean;
  public file_url!: string;
  public status!: 'pending' | 'verified' | 'rejected';
  public admin_status!: 'pending' | 'verified' | 'rejected';
  public verified_by!: string | null;
  public verified_at!: Date | null;
  public credits_used!: number;
  public ai_checked!: boolean;
  public ai_credits_used!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SupplierDocument.init(
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
    section: {
      type: DataTypes.ENUM('basic_info', 'kyc_info', 'contact_info'),
      allowNull: false,
    },
    section_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    section_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified_type: {
      type: DataTypes.ENUM('mono_docs', 'admin'),
      allowNull: true,
    },
    document_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    admin_status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    credits_used: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    ai_checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ai_credits_used: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'supplier_documents',
    modelName: 'SupplierDocument',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SupplierDocument;
export type { SupplierDocumentCreationAttributes };
