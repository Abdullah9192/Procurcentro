import {
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Subsidiary from './Subsidiary';
import SubsidiaryBranch from './SubsidiaryBranch';

interface BranchDepartmentAttributes {
  id: string;
  department_name: string;
  subsidiary_id: string;
  subsidiary_branch_id: string;
  organization_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type BranchDepartmentCreationAttributes = Optional<
  BranchDepartmentAttributes,
  'id' | 'is_active' | 'created_at' | 'updated_at'
>;

class BranchDepartment
  extends Model<BranchDepartmentAttributes, BranchDepartmentCreationAttributes>
  implements BranchDepartmentAttributes {
  public id!: string;
  public department_name!: string;
  public subsidiary_id!: string;
  public subsidiary_branch_id!: string;
  public organization_id!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getSubsidiary!: BelongsToGetAssociationMixin<Subsidiary>;
  public getSubsidiaryBranch!: BelongsToGetAssociationMixin<SubsidiaryBranch>;

  public static associations: {
    subsidiary: Association<BranchDepartment, Subsidiary>;
    subsidiaryBranch: Association<BranchDepartment, SubsidiaryBranch>;
  };
}

BranchDepartment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    department_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subsidiary_branch_id: {
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
    tableName: 'branch_departments',
    modelName: 'BranchDepartment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default BranchDepartment;
