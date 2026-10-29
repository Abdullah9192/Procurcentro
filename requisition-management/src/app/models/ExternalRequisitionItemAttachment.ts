import {
  Model,
  DataTypes,
  Optional
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface ExternalRequisitionItemAttachmentAttributes {
  id: string;
  external_requisition_item_id: string;
  file_url: string;
  file_name: string;
  created_at: Date;
  updated_at: Date;
}

type ExternalRequisitionItemAttachmentCreationAttributes = Optional<
  ExternalRequisitionItemAttachmentAttributes,
  'id' | 'created_at' | 'updated_at'
>;

class ExternalRequisitionItemAttachment
  extends Model<
    ExternalRequisitionItemAttachmentAttributes,
    ExternalRequisitionItemAttachmentCreationAttributes
  >
  implements ExternalRequisitionItemAttachmentAttributes
{
  public id!: string;
  public external_requisition_item_id!: string;
  public file_url!: string;
  public file_name!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

ExternalRequisitionItemAttachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    external_requisition_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'external_requisition_item_attachments',
    modelName: 'ExternalRequisitionItemAttachment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ExternalRequisitionItemAttachment;
