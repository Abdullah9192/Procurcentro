import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

export interface ClaimReturnItemAttributes {
  id: string;
  claim_id: string;
  line_item_id: string;
  rejected_quantity?: number | null;
  rejected_reason?:
    | "damaged"
    | "wrong_item"
    | "missing_part"
    | "defective"
    | "late_delivery"
    | "incorrect_size"
    | "faulty_mechanism"
    | "expired_product"
    | "unsatisfied_quality"
    | "not_as_described"
    | "poor_packaging"
    | "customer_service_issue"
    | null;
  description?: string | null;
  attach_evidence?: object | null;
  resolution_type?: "refund" | "return" | "replacement" | "credit_note" | null;
  additional_details?: string | null;
  status:
    | "pending"
    | "accepted"
    | "resolved"
    | "disputed"
    | "resolution_enforced";
  created_at?: Date;
  updated_at?: Date;
}

export interface ClaimReturnItemCreationAttributes
  extends Optional<
    ClaimReturnItemAttributes,
    | "id"
    | "rejected_quantity"
    | "rejected_reason"
    | "description"
    | "attach_evidence"
    | "resolution_type"
    | "additional_details"
    | "created_at"
    | "updated_at"
  > {}

class ClaimReturnItem
  extends Model<
    ClaimReturnItemAttributes,
    ClaimReturnItemCreationAttributes
  >
  implements ClaimReturnItemAttributes {
  public id!: string;
  public claim_id!: string;
  public line_item_id!: string;
  public rejected_quantity!: number | null;
  public rejected_reason!: ClaimReturnItemAttributes["rejected_reason"];
  public description!: string | null;
  public attach_evidence!: object | null;
  public resolution_type!: ClaimReturnItemAttributes["resolution_type"];
  public additional_details!: string | null;
  public status!: ClaimReturnItemAttributes["status"];
  public created_at!: Date;
  public updated_at!: Date;
}

ClaimReturnItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    claim_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    line_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rejected_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rejected_reason: {
      type: DataTypes.ENUM(
        "damaged",
        "wrong_item",
        "missing_part",
        "defective",
        "late_delivery",
        "incorrect_size",
        "faulty_mechanism",
        "expired_product",
        "unsatisfied_quality",
        "not_as_described",
        "poor_packaging",
        "customer_service_issue"
      ),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attach_evidence: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    resolution_type: {
      type: DataTypes.ENUM(
        "refund",
        "return",
        "replacement",
        "credit_note"
      ),
      allowNull: true,
    },
    additional_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "resolved",
        "disputed",
        "resolution_enforced"
      ),
      allowNull: false,
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
    tableName: "claim_return_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ClaimReturnItem;
