import {
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Subsidiary from './Subsidiary';

interface SubsidiaryBranchAttributes {
  id: string;
  branch_name: string;
  address: string;
  latitude?: string;
  longitude?: string;
  subsidiary_id: string;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type SubsidiaryBranchCreationAttributes = Optional<
  SubsidiaryBranchAttributes,
  'id' | 'latitude' | 'longitude' | 'is_active' |'created_at' | 'updated_at'
>;

class SubsidiaryBranch
  extends Model<SubsidiaryBranchAttributes, SubsidiaryBranchCreationAttributes>
  implements SubsidiaryBranchAttributes {
  public id!: string;
  public branch_name!: string;
  public address!: string;
  public latitude?: string;
  public longitude?: string;
  public subsidiary_id!: string;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getSubsidiary!: BelongsToGetAssociationMixin<Subsidiary>;

  public static associations: {
    subsidiary: Association<SubsidiaryBranch, Subsidiary>;
  };
}

SubsidiaryBranch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    branch_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subsidiary_id: {
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
    tableName: 'subsidiary_branches',
    modelName: 'SubsidiaryBranch',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SubsidiaryBranch;
