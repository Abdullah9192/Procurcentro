import { DataTypes, Model, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface OrderContractSignerAttributes {
  id: string;
  order_contract_id: string;

  name: string;
  email: string;

  type: "organization" | "supplier";

  signer_order: number;

  status: "pending" | "signed";

  created_at?: Date;
  updated_at?: Date;
}

type OrderContractSignerCreationAttributes = Optional<
  OrderContractSignerAttributes,
  | "id"
  | "status"
  | "created_at"
  | "updated_at"
>;

class OrderContractSigner
  extends Model<
    OrderContractSignerAttributes,
    OrderContractSignerCreationAttributes
  >
  implements OrderContractSignerAttributes
{
  public id!: string;
  public order_contract_id!: string;

  public name!: string;
  public email!: string;

  public type!: "organization" | "supplier";

  public signer_order!: number;

  public status!: "pending" | "signed";

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderContractSigner.init(
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("organization", "supplier"),
      allowNull: false,
    },

    signer_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "signed"),
      defaultValue: "pending",
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
    tableName: "order_contract_signers",
    modelName: "OrderContractSigner",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default OrderContractSigner;