import {
  Model,
  DataTypes,
  Optional,
  HasManyGetAssociationsMixin,
  BelongsToGetAssociationMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import ApprovalWorkflow from './ApprovalWorkflow';
import ApprovalWorkflowStepApprover from './ApprovalWorkflowStepApprover';

interface ApprovalWorkflowStepAttributes {
  id: string;
  workflow_id: string;
  organization_id: string;
  step_number: number;
  created_at?: Date;
  updated_at?: Date;
}

type ApprovalWorkflowStepCreationAttributes = Optional<
  ApprovalWorkflowStepAttributes,
  'id' | 'created_at' | 'updated_at'
>;

class ApprovalWorkflowStep extends Model<
  ApprovalWorkflowStepAttributes,
  ApprovalWorkflowStepCreationAttributes
> {
  public id!: string;
  public workflow_id!: string;
  public organization_id!: string;
  public step_number!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getWorkflow!: BelongsToGetAssociationMixin<ApprovalWorkflow>;
  public getApprovers!: HasManyGetAssociationsMixin<ApprovalWorkflowStepApprover>;
}

ApprovalWorkflowStep.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workflow_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    step_number: {
      type: DataTypes.INTEGER,
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
    tableName: 'approval_workflow_steps',
    modelName: 'ApprovalWorkflowStep',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);



export default ApprovalWorkflowStep;
