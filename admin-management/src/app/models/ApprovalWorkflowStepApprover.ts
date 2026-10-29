import {
  Model,
  DataTypes,
  Optional,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import ApprovalWorkflowStep from './ApprovalWorkflowStep';
import User from './User';

interface ApprovalWorkflowStepApproverAttributes {
  id: string;
  step_id: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

type ApprovalWorkflowStepApproverCreationAttributes = Optional<
  ApprovalWorkflowStepApproverAttributes,
  'id' | 'created_at' | 'updated_at'
>;

class ApprovalWorkflowStepApprover extends Model<
  ApprovalWorkflowStepApproverAttributes,
  ApprovalWorkflowStepApproverCreationAttributes
> {
  public id!: string;
  public step_id!: string;
  public user_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getStep!: BelongsToGetAssociationMixin<ApprovalWorkflowStep>;
   public getUser!: BelongsToGetAssociationMixin<User>;
}

ApprovalWorkflowStepApprover.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    step_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
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
    modelName: 'ApprovalWorkflowStepApprover',
    tableName: 'approval_workflow_step_approvers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ApprovalWorkflowStepApprover;
