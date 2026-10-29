import {
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import OrgCategory from './OrgCategory';
import Organization from './Organization';

interface OrgSubCategoryAttributes {
  id: string;
  name: string;
  org_category_id: string;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type OrgSubCategoryCreationAttributes = Optional<
  OrgSubCategoryAttributes,
  'id' | 'is_active' | 'created_at' | 'updated_at'
>;

class OrgSubCategory
  extends Model<OrgSubCategoryAttributes, OrgSubCategoryCreationAttributes>
  implements OrgSubCategoryAttributes {
  public id!: string;
  public name!: string;
  public org_category_id!: string;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Accessors
  public getCategory!: BelongsToGetAssociationMixin<OrgCategory>;
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;

  public static associations: {
    category: Association<OrgSubCategory, OrgCategory>;
    organization: Association<OrgSubCategory, Organization>;
  };
}

OrgSubCategory.init(
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
    modelName: 'OrgSubCategory',
    tableName: 'org_sub_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);



export default OrgSubCategory;
