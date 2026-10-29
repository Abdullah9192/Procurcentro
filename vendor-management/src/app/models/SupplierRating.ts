import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/DatabaseSource";

interface SupplierRatingAttributes {
  id: string;
  supplier_user_id: string;
  rating_user_id: string;
  quality_item_rating: number;
  fullfill_order_rating: number;
  resolving_complaint_rating: number;
  shipment_terms_rating: number;
  communication_rating: number;
  experience_working_rating: number;
  overall_rating: number;
  comment?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface SupplierRatingCreationAttributes
  extends Optional<SupplierRatingAttributes, "id" | "comment" | "created_at" | "updated_at"> {}

class SupplierRating
  extends Model<SupplierRatingAttributes, SupplierRatingCreationAttributes>
  implements SupplierRatingAttributes
{
  public id!: string;
  public supplier_user_id!: string;
  public rating_user_id!: string;
  public quality_item_rating!: number;
  public fullfill_order_rating!: number;
  public resolving_complaint_rating!: number;
  public shipment_terms_rating!: number;
  public communication_rating!: number;
  public experience_working_rating!: number;
  public overall_rating!: number;
  public comment?: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SupplierRating.init(
  {
 id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    supplier_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quality_item_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fullfill_order_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resolving_complaint_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shipment_terms_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    communication_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    experience_working_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    overall_rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
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
    sequelize,
     modelName: "SupplierRating",
    tableName: "supplier_ratings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupplierRating;
export type { SupplierRatingAttributes, SupplierRatingCreationAttributes };
