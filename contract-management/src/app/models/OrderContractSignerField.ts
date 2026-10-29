import { DataTypes, Model, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface OrderContractSignerFieldAttributes {
  id: string;

  order_contract_id: string;
  order_contract_signer_id: string;

  field_type: string;

  page_no: number;

  x_position: number;
  y_position: number;

  width: number;
  height: number;

  is_required: boolean;

  created_at?: Date;
  updated_at?: Date;
}

type OrderContractSignerFieldCreationAttributes = Optional<
  OrderContractSignerFieldAttributes,
  | "id"
  | "is_required"
  | "created_at"
  | "updated_at"
>;

class OrderContractSignerField
  extends Model<
    OrderContractSignerFieldAttributes,
    OrderContractSignerFieldCreationAttributes
  >
  implements OrderContractSignerFieldAttributes
{
  public id!: string;

  public order_contract_id!: string;
  public order_contract_signer_id!: string;

  public field_type!: string;

  public page_no!: number;

  public x_position!: number;
  public y_position!: number;

  public width!: number;
  public height!: number;

  public is_required!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderContractSignerField.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    order_contract_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    order_contract_signer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    field_type: {
      type: DataTypes.STRING,
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

    is_required: {
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
    tableName: "order_contract_signer_fields",
    modelName: "OrderContractSignerField",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default OrderContractSignerField;