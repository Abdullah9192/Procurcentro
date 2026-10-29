import { DataTypes, Model, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import ContractSignerField from "./ContractSignerField";

export type ContractSignerStatus =
  | "pending"
  | "sent"
  | "viewed"
  | "signed"
  | "declined";

export type ContractSignerType = "organization" | "counter_party";

interface ContractSignerAttributes {
  id: string;

  contract_id: string;

  signer_type: ContractSignerType;

  name: string;
  email: string;
  signer_order?: number | null;
  // 🔹 BoldSign tracking
  boldsign_signer_id?: string | null;
  status: ContractSignerStatus;

  created_at?: Date;
  updated_at?: Date;
}

type ContractSignerCreationAttributes = Optional<
  ContractSignerAttributes,
  | "id"
  | "signer_order"
  | "boldsign_signer_id"
  | "status"
  | "created_at"
  | "updated_at"
>;

class ContractSigner
  extends Model<ContractSignerAttributes, ContractSignerCreationAttributes>
  implements ContractSignerAttributes
{
  public id!: string;

  public contract_id!: string;

  public signer_type!: ContractSignerType;

  public name!: string;
  public email!: string;

  public signer_order?: number | null;

  public boldsign_signer_id?: string | null;
  public status!: ContractSignerStatus;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public readonly fields?: ContractSignerField[];
}

ContractSigner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    contract_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contracts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    signer_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    boldsign_signer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "sent", "viewed", "signed", "declined"),
      allowNull: false,
      defaultValue: "pending",
    },

    signer_type: {
      type: DataTypes.ENUM("organization", "counter_party"),
      allowNull: false,
      comment: "Field belongs to which party",
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
    tableName: "contract_signers",
    modelName: "ContractSigner",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default ContractSigner;
