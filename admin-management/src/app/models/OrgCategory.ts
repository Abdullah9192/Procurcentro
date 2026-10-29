import {
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Organization from './Organization';
import OrgSubCategory from './OrgSubCategory';
import OrgCategoryService from './OrgCategoryService';

interface OrgCategoryAttributes {
  id: string;
  category_name: string;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type OrgCategoryCreationAttributes = Optional<
  OrgCategoryAttributes,
  'id' | 'is_active' | 'created_at' | 'updated_at'
>;

class OrgCategory
  extends Model<OrgCategoryAttributes, OrgCategoryCreationAttributes>
  implements OrgCategoryAttributes {
  public id!: string;
  public category_name!: string;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Accessors
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;
  public getOrgSubCategories!: HasManyGetAssociationsMixin<OrgSubCategory>;
  public getServices!: HasManyGetAssociationsMixin<OrgCategoryService>;

  public static associations: {
    organization: Association<OrgCategory, Organization>;
    org_sub_categories: Association<OrgCategory, OrgSubCategory>;
    services: Association<OrgCategory, OrgCategoryService>;
  };
}

OrgCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING,
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
    modelName: 'OrgCategory',
    tableName: 'org_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default OrgCategory;
