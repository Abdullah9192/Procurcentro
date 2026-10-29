import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export interface AuditLogAttributes {
  id: string;
  subsidiary_id: string;
  subsidiary: string;
  organization_id: string;
  user_id: string;
  log_id: string;
  user_role: string;
  department: string;
  department_id: string;
  branch: string;
  branch_id: string;
  change: string;
  action_performed: string;
  feature: string;
  change_log: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuditLogCreationAttributes
  extends Optional<
    AuditLogAttributes,
    "id" | "subsidiary_id" | "createdAt" | "updatedAt"
  > {}

class AuditLogModel
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  public id!: string;
  public organization_id: string;
  public log_id: string;
  public user_id: string;
  public subsidiary_id: string;
  public subsidiary: string;
  public user_role: string;
  public department: string;
  public department_id: string;
  public branch: string;
  public branch_id: string;
  public change: string;
  public action_performed: string;
  public feature: string;
  public change_log: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

AuditLogModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    log_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subsidiary: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    change: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action_performed: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    change_log: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    tableName: "audit_logs",
    timestamps: true,
  }
);

export default AuditLogModel;
