import {
  Model,
  DataTypes,
  Optional
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface OrgItemImageAttributes {
  id: string;
  org_item_id: string;
  file_url: string;
  created_at?: Date;
  updated_at?: Date;
}

type OrgItemImageCreationAttributes = Optional<
  OrgItemImageAttributes,
  'id' | 'created_at' | 'updated_at'
>;

class OrgItemImage extends Model<
  OrgItemImageAttributes,
  OrgItemImageCreationAttributes
> implements OrgItemImageAttributes {
  public id!: string;
  public org_item_id!: string;
  public file_url!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

OrgItemImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    org_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    file_url: {
      type: DataTypes.TEXT,
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
    tableName: 'org_item_images',
    modelName: 'OrgItemImage',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrgItemImage;
