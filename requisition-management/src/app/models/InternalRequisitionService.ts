import {
    Model,
    DataTypes,
    Optional
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface InternalRequisitionServiceAttributes {
    id: string;
    requisition_id: string;
    org_item_id: string | null;
    quantity: number;
    use_type: 'one_time' | 'recurring'; // Changed from 'one_time' | 'recurring' to match migration
    frequency: string | null;
    start_date: string | null;
    end_date: string | null;
    comment: string | null;
    created_at: Date;
    updated_at: Date;
}

type InternalRequisitionServiceCreationAttributes = Optional<
    InternalRequisitionServiceAttributes,
    'id' | 'org_item_id' | 'frequency' | 'start_date' | 'end_date' | 'comment' | 'created_at' | 'updated_at'
>;

class InternalRequisitionService
    extends Model<InternalRequisitionServiceAttributes, InternalRequisitionServiceCreationAttributes>
    implements InternalRequisitionServiceAttributes {
    public id!: string;
    public requisition_id!: string;
    public org_item_id!: string | null;
    public quantity!: number;
    public use_type!: 'one_time' | 'recurring';
    public start_date: string | null;
    public end_date: string | null;
    public frequency: string | null;
    public comment!: string | null;
    public created_at!: Date;
    public updated_at!: Date;
}

InternalRequisitionService.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        requisition_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        org_item_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        use_type: {
            type: DataTypes.ENUM('one_time', 'recurring'),
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        frequency: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        sequelize: AppDataSource,
        tableName: 'internal_requisition_services',
        modelName: 'InternalRequisitionService',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default InternalRequisitionService;
