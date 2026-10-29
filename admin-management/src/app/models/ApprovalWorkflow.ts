import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Organization from './Organization';
import ApprovalWorkflowStep from './ApprovalWorkflowStep';

interface ApprovalWorkflowAttributes {
  id: string;
  organization_id: string;
  subsidiary_branch_id?: string;
  branch_department_id?: string;
  subsidiary_id?: string;
  name: string;
  description?: string;
  approval_type: 'linear' | 'parallel';
  allow_approval_comments: boolean;
  allow_rejection_comments: boolean;
  reminder_enable: boolean;
  reminder_frequency: '12' | '24' | '48';
  escalate_enable: boolean;
  escalate_to: 'admin' | 'next_level_approver' | 'all_stakeholders';
  skip_if_requester_is_approver: boolean;
  auto_approve_multiple_steps: boolean;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type ApprovalWorkflowCreationAttributes = Optional<
  ApprovalWorkflowAttributes,
  'id' | 'description' | 'subsidiary_id' | 'is_active' | 'subsidiary_branch_id' | 'branch_department_id' | 'created_at' | 'updated_at'
>;

class ApprovalWorkflow extends Model<
  ApprovalWorkflowAttributes,
  ApprovalWorkflowCreationAttributes
> {
  public id!: string;
  public organization_id!: string;
  public subsidiary_branch_id?: string;
  public branch_department_id?: string;
  public subsidiary_id?: string;
  public name!: string;
  public description?: string;
  public approval_type!: 'linear' | 'parallel';
  public allow_approval_comments!: boolean;
  public allow_rejection_comments!: boolean;
  public reminder_enable!: boolean;
  public reminder_frequency!: '12' | '24' | '48';
  public escalate_enable!: boolean;
  public escalate_to!: 'admin' | 'next_level_approver' | 'all_stakeholders';
  public skip_if_requester_is_approver!: boolean;
  public auto_approve_multiple_steps!: boolean;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getOrganization!: BelongsToGetAssociationMixin<Organization>;
  public getSteps!: HasManyGetAssociationsMixin<ApprovalWorkflowStep>;
}

ApprovalWorkflow.init(
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
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subsidiary_branch_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    branch_department_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approval_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'linear',
    },
    allow_approval_comments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allow_rejection_comments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reminder_enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reminder_frequency: {
      type: DataTypes.STRING(20),
      defaultValue: '12',
    },
    escalate_enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    escalate_to: {
      type: DataTypes.STRING(50),
      defaultValue: 'admin',
    },
    skip_if_requester_is_approver: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    auto_approve_multiple_steps: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'approval_workflows',
    modelName: 'ApprovalWorkflow',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);


export default ApprovalWorkflow;
