import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface VendorEvaluationAttributes {
  id: string;
  organization_id: string;
  quality?: string | null;
  timeliness?: string | null;
  issue_resolution?: string | null;
  adherence?: string | null;
  communication?: string | null;
  overall?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

type VendorEvaluationCreationAttributes = Optional<
  VendorEvaluationAttributes,
  'id' | 'created_at' | 'updated_at'
>;

class VendorEvaluation
  extends Model<VendorEvaluationAttributes, VendorEvaluationCreationAttributes>
  implements VendorEvaluationAttributes {

  public id!: string;
  public organization_id!: string;
  public quality!: string | null;
  public timeliness!: string | null;
  public issue_resolution!: string | null;
  public adherence!: string | null;
  public communication!: string | null;
  public overall!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

VendorEvaluation.init(
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
    quality: { type: DataTypes.STRING, allowNull: true },
    timeliness: { type: DataTypes.STRING, allowNull: true },
    issue_resolution: { type: DataTypes.STRING, allowNull: true },
    adherence: { type: DataTypes.STRING, allowNull: true },
    communication: { type: DataTypes.STRING, allowNull: true },
    overall: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize: AppDataSource,
    tableName: 'vendor_evaluations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default VendorEvaluation;
