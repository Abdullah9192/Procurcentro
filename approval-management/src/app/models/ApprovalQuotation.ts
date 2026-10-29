// models/ApprovalRequisition.ts
import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface ApprovalQuotationAttributes {
    id: string;
    quotation_id: string;
    approval_id: string;
    approval_role_id: string;
    approval_role_name: string;
    approval_user_type: string;
    status_reason: string;
    status: "approved" | "rejected" | "pending";
    created_at?: Date;
    updated_at?: Date;
}

type ApprovalQuotationCreationAttributes = Optional<
    ApprovalQuotationAttributes,
    "id" | "created_at" | "updated_at" | "status_reason"
>;

class ApprovalQuotation
    extends Model<
        ApprovalQuotationAttributes,
        ApprovalQuotationCreationAttributes
    >
    implements ApprovalQuotationAttributes {
    public id!: string;
    public quotation_id!: string;
    public approval_id!: string;
    public approval_role_id!: string;
    public approval_role_name!: string;
    public approval_user_type!: string;
    public status_reason!: string;
    public status!:
        | "approved"
        | "rejected"
        | "pending";
    public created_at!: Date;
    public updated_at!: Date;
}

ApprovalQuotation.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        quotation_id: {
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
        status: {
            type: DataTypes.ENUM(
                "approved",
                "rejected",
                "pending"
            ),
            allowNull: false,
            defaultValue: "pending",
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
        tableName: "approval_quotations",
        modelName: "ApprovalQuotation",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default ApprovalQuotation;
