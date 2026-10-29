import { DataTypes, Model, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export type ContractSignerFieldType =
  | "signature"
  | "initials"
  | "date"
  | "name"
  | "company_stamp"
  | "text";

interface ContractSignerFieldAttributes {
  id: string;

  contract_id: string;
  contract_signer_id: string;

  field_type: ContractSignerFieldType;

  page_no: number;

  x_position: number;
  y_position: number;
  width: number;
  height: number;

  boldsign_field_id?: string | null;

  is_required: boolean;

  created_at?: Date;
  updated_at?: Date;
}

type ContractSignerFieldCreationAttributes = Optional<
  ContractSignerFieldAttributes,
  | "id"
  | "boldsign_field_id"
  | "created_at"
  | "updated_at"
>;

class ContractSignerField
  extends Model<
    ContractSignerFieldAttributes,
    ContractSignerFieldCreationAttributes
  >
  implements ContractSignerFieldAttributes
{
  public id!: string;

  public contract_id!: string;
  public contract_signer_id!: string;

  public field_type!: ContractSignerFieldType;

  public page_no!: number;

  public x_position!: number;
  public y_position!: number;
  public width!: number;
  public height!: number;

  public boldsign_field_id?: string | null;

  public is_required!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ContractSignerField.init(
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

    contract_signer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contract_signers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    field_type: {
      type: DataTypes.ENUM(
        "signature",
        "initials",
        "date",
        "name",
        "company_stamp",
        "text"
      ),
      allowNull: false,
    },

    page_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    x_position: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    y_position: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    width: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    height: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    boldsign_field_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: "contract_signer_fields",
    modelName: "ContractSignerField",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ContractSignerField;
