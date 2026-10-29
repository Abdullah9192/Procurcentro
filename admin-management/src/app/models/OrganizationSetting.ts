import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import Organization from './Organization';
import Subsidiary from './Subsidiary';

interface OrganizationSettingAttributes {
    id: string;
    organization_id: string;
    subsidiary_id: string | null;
    type: string;
    settings: object;
    created_by: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizationSettingWithRelations extends OrganizationSettingAttributes {
    organization?: Organization;
    subsidiary?: Subsidiary;
}

interface OrganizationSettingCreationAttributes extends Optional<OrganizationSettingAttributes,
    'id' | 'subsidiary_id' | 'created_by' | 'createdAt' | 'updatedAt'> { }

class OrganizationSetting extends Model<OrganizationSettingAttributes, OrganizationSettingCreationAttributes>
    implements OrganizationSettingAttributes {

    public id!: string;
    public organization_id!: string;
    public subsidiary_id!: string | null;
    public type!: string;
    public settings!: object;
    public created_by!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly organization?: Organization;
    public readonly subsidiary?: Subsidiary;
}

OrganizationSetting.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        organization_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        subsidiary_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'subsidiaries',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        type: {
            type: DataTypes.ENUM(
                'purchase_requisition',
                'quotations',
                'purchase_orders',
                'invoice',
                'inventory',
                'contract'
            ),
            allowNull: false,
            validate: {
                notEmpty: true,
                isIn: [['purchase_requisition', 'quotations', 'purchase_orders', 'invoice', 'inventory', 'contract']]
            }
        },
        settings: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            validate: {
                isValidSettings(value: any) {
                    if (typeof value !== 'object' || value === null) {
                        throw new Error('Settings must be a valid JSON object');
                    }
                }
            }
        },

        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize: AppDataSource,
        modelName: 'OrganizationSetting',
        tableName: 'organization_settings',
        timestamps: true,
        indexes: [
            {
                fields: ['organization_id', 'subsidiary_id', 'type'],
                unique: true,
                name: 'organization_settings_unique_constraint'
            },
            {
                fields: ['organization_id'],
                name: 'organization_settings_organization_id'
            },
            {
                fields: ['subsidiary_id'],
                name: 'organization_settings_subsidiary_id'
            },
            {
                fields: ['type'],
                name: 'organization_settings_type'
            },
            {
                fields: ['created_by'],
                name: 'organization_settings_created_by'
            }
        ]
    }
);

export default OrganizationSetting;