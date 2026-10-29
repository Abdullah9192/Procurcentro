import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/DatabaseSource";

interface SupplierCreditWalletAttributes {
  id: string;
  organization_id: string;
  user_id?: string | null;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SupplierCreditWalletCreationAttributes
  extends Optional<SupplierCreditWalletAttributes, "id" | "user_id" | "balance"> { }

class SupplierCreditWallet
  extends Model<SupplierCreditWalletAttributes, SupplierCreditWalletCreationAttributes>
  implements SupplierCreditWalletAttributes {
  public id!: string;
  public organization_id!: string;
  public user_id!: string | null;
  public balance!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SupplierCreditWallet.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
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
    sequelize,
    tableName: "supplier_credit_wallets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupplierCreditWallet;
