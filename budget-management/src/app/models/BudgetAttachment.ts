import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Budget from './Budget';

interface BudgetAttachmentAttributes {
  id: string;
  budget_id: string;
  filename?: string;
  original_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  created_at?: Date;
  updated_at?: Date;
}

type BudgetAttachmentCreationAttributes = Optional<
  BudgetAttachmentAttributes,
  'id' | 'filename' | 'original_name' | 'file_path' | 'file_size' | 'mime_type' | 'created_at' | 'updated_at'
>;

class BudgetAttachment extends Model<
  BudgetAttachmentAttributes,
  BudgetAttachmentCreationAttributes
> implements BudgetAttachmentAttributes {
  public id!: string;
  public budget_id!: string;
  public filename?: string;
  public original_name?: string;
  public file_path?: string;
  public file_size?: number;
  public mime_type?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BudgetAttachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mime_type: {
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
    modelName: 'BudgetAttachment',
    tableName: 'budget_attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default BudgetAttachment;
