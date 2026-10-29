import {
    Model,
    DataTypes,
    Optional
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';

interface SupplierItemImageAttributes {
    id: string;
    supplier_catalogue_id: string;
    file_url: string;
    created_at?: Date;
    updated_at?: Date;
}

type SupplierItemImageCreationAttributes = Optional<
    SupplierItemImageAttributes,
    'id' | 'created_at' | 'updated_at'
>;

class SupplierItemImage extends Model<
    SupplierItemImageAttributes,
    SupplierItemImageCreationAttributes
> implements SupplierItemImageAttributes {
    public id!: string;
    public supplier_catalogue_id!: string;
    public file_url!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

SupplierItemImage.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        supplier_catalogue_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        file_url: {
            type: DataTypes.TEXT,
            allowNull: false,
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
        tableName: 'supplier_catalogue_images',
        modelName: 'SupplierCatalogueImage',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default SupplierItemImage;
