import {
  DataTypes,
  Model,
  Optional,
  BelongsToGetAssociationMixin,
  Association,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import OrgCategory from './OrgCategory';
import Organization from './Organization';

interface OrgCategoryServiceAttributes {
  id: string;
  name: string;
  description: string;
  org_category_id: string;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type OrgCategoryServiceCreationAttributes = Optional<
  OrgCategoryServiceAttributes,
  'id' | 'is_active' | 'created_at' | 'updated_at'
>;

class OrgCategoryService
  extends Model<OrgCategoryServiceAttributes, OrgCategoryServiceCreationAttributes>
  implements OrgCategoryServiceAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public org_category_id!: string;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Accessors
  public getCategory!: BelongsToGetAssociationMixin<OrgCategory>;
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;

  public static associations: {
    category: Association<OrgCategoryService, OrgCategory>;
    organization: Association<OrgCategoryService, Organization>;
  };
}

OrgCategoryService.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'OrgCategoryService',
    tableName: 'org_category_services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrgCategoryService;
