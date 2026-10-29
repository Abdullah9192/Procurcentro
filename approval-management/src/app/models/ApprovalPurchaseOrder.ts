// models/ApprovalRequisition.ts
import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface ApprovalPurchaseOrderAttributes {
    id: string;
    order_id: string;
    approval_id: string;
    approval_role_id: string;
    approval_role_name: string;
    approval_user_type: string;
    status_reason: string;
    created_at?: Date;
    updated_at?: Date;
}

type ApprovalPurchaseOrderCreationAttributes = Optional<
    ApprovalPurchaseOrderAttributes,
    "id" | "created_at" | "updated_at" | "status_reason"
>;

class ApprovalPurchaseOrder
    extends Model<
        ApprovalPurchaseOrderAttributes,
        ApprovalPurchaseOrderCreationAttributes
    >
    implements ApprovalPurchaseOrderAttributes {
    public id!: string;
    public order_id!: string;
    public approval_id!: string;
    public approval_role_id!: string;
    public approval_role_name!: string;
    public approval_user_type!: string;
    public status_reason!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

ApprovalPurchaseOrder.init(
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
        approval_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        approval_role_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        approval_role_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        approval_user_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status_reason: {
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
        sequelize: AppDataSource,
        tableName: "approval_purchase_orders",
        modelName: "ApprovalPurchaseOrder",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default ApprovalPurchaseOrder;
