import {
  DataTypes,
  Model,
  Optional,
  BelongsToGetAssociationMixin,
  Association,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Organization from './Organization';

interface OrgCurrencyAttributes {
  id: string;
  currency: string;
  round_setting: string;
  is_main: boolean;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type OrgCurrencyCreationAttributes = Optional<
  OrgCurrencyAttributes,
  'id' | 'is_active' | 'is_main' | 'created_at' | 'updated_at'
>;

class OrgCurrency
  extends Model<OrgCurrencyAttributes, OrgCurrencyCreationAttributes>
  implements OrgCurrencyAttributes {
  public id!: string;
  public currency!: string;
  public round_setting!: string;
  public is_main!: boolean;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getOrganization!: BelongsToGetAssociationMixin<Organization>;

  public static associations: {
    organization: Association<OrgCurrency, Organization>;
  };
}

OrgCurrency.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    round_setting: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: 'OrgCurrency',
    tableName: 'org_currencies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);


export default OrgCurrency;
