import { Model, DataTypes, Optional } from "sequelize";
import sequelizeConnection from "../../config/DatabaseSource";

interface ContractTypeAttributes {
  id: string;
  organization_id: string;
  contract_type: string;
  docs_url?: string | null;
  name: string;
  description?: string | null;
  approval_work_flow_id?: string | null;
  org_category_id?: string | null;
  date_modification?: Date | null;
  created_by?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface ContractTypeCreationAttributes
  extends Optional<
    ContractTypeAttributes,
    | "id"
    | "docs_url"
    | "description"
    | "approval_work_flow_id"
    | "org_category_id"
    | "date_modification"
    | "created_by"
    | "created_at"
    | "updated_at"
  > {}

class ContractType
  extends Model<ContractTypeAttributes, ContractTypeCreationAttributes>
  implements ContractTypeAttributes
{
  public id!: string;
  public organization_id!: string;
  public contract_type!: string;
  public docs_url?: string | null;
  public name!: string;
  public description?: string | null;
  public approval_work_flow_id?: string | null;
  public org_category_id?: string | null;
  public date_modification?: Date | null;
  public created_by?: string | null;
  public created_at?: Date;
  public updated_at?: Date;
}

ContractType.init(
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
    contract_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    docs_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    approval_work_flow_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    org_category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    date_modification: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
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
    sequelize: sequelizeConnection,
    tableName: "contract_types",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ContractType;
