import { DataTypes, Model, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface OrderContractAttributes {
    id: string;
    purchase_order_id: string;
    organization_id: string;

    document: string | null;

    boldsign_document_id: string | null;

    organization_signed: boolean;
    supplier_signed: boolean;

    status: "draft" | "sent" | "completed";

    created_at?: Date;
    updated_at?: Date;
}

type OrderContractCreationAttributes = Optional<
    OrderContractAttributes,
    | "id"
    | "document"
    | "boldsign_document_id"
    | "organization_signed"
    | "supplier_signed"
    | "created_at"
    | "updated_at"
>;

class OrderContract
    extends Model<
        OrderContractAttributes,
        OrderContractCreationAttributes
    >
    implements OrderContractAttributes {
    public id!: string;
    public purchase_order_id!: string;
    public organization_id!: string;

    public document!: string | null;

    public boldsign_document_id!: string | null;

    public organization_signed!: boolean;
    public supplier_signed!: boolean;

    public status!: "draft" | "sent" | "completed";

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

OrderContract.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        purchase_order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        organization_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        document: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        boldsign_document_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        organization_signed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        supplier_signed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        status: {
            type: DataTypes.ENUM(
                "draft",
                "sent",
                "completed"
            ),
            defaultValue: "draft",
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
        tableName: "order_contracts",
        modelName: "OrderContract",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default OrderContract;