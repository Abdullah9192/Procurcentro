import {
    Model,
    DataTypes,
    Optional,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource'; // Your sequelize instance

interface IndustryAttributes {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

type IndustryCreationAttributes = Optional<
    IndustryAttributes,
    | 'id'
    | 'created_at'
    | 'updated_at'
>;

class SupplierIndustry extends Model<
    IndustryAttributes,
    IndustryCreationAttributes
> {
    public id!: string;
    public name!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

SupplierIndustry.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: 'Industry name cannot be empty'
                },
                len: {
                    args: [2, 100],
                    msg: 'Industry name must be between 2 and 100 characters'
                }
            }
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
        tableName: 'supplier_industries',
        modelName: 'SupplierIndustry',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default SupplierIndustry;