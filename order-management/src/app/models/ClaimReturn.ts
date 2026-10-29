import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export interface ClaimReturnAttributes {
  id: string;
  order_id: string;
  claim_gen_id: string;
  organization_id: string;
  date_raised: Date;
  date_resolved?: Date | null;
  priority: "high" | "mid" | "low";
  admin_status:
    | "pending_review"
    | "pending_supplier_response"
    | "approved"
    | "disputed"
    | "draft";
  supplier_status?:
    | "pending_response"
    | "in_review"
    | "accepted"
    | "resolved"
    | "disputed"
    | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ClaimReturnCreationAttributes
  extends Optional<
    ClaimReturnAttributes,
    "id" | "date_resolved" | "supplier_status" | "created_at" | "updated_at"
  > {}

class ClaimReturn
  extends Model<ClaimReturnAttributes, ClaimReturnCreationAttributes>
  implements ClaimReturnAttributes {
  public id!: string;
  public order_id!: string;
  public claim_gen_id!: string;
  public organization_id!: string;
  public date_raised!: Date;
  public date_resolved!: Date | null;
  public priority!: "high" | "mid" | "low";
  public admin_status!: ClaimReturnAttributes["admin_status"];
  public supplier_status!: ClaimReturnAttributes["supplier_status"];
  public created_at!: Date;
  public updated_at!: Date;
}

ClaimReturn.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    claim_gen_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date_raised: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_resolved: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("high", "mid", "low"),
      allowNull: false,
    },
    admin_status: {
      type: DataTypes.ENUM(
        "pending_review",
        "pending_supplier_response",
        "approved",
        "disputed",
        "draft"
      ),
      allowNull: false,
      defaultValue: "pending_review",
    },
    supplier_status: {
      type: DataTypes.ENUM(
        "pending_response",
        "in_review",
        "accepted",
        "resolved",
        "disputed"
      ),
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
    sequelize: AppDataSource,
    tableName: "claim_returns",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ClaimReturn;
