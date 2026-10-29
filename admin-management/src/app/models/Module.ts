import { Model, DataTypes, Optional } from 'sequelize';
import AppDataSource from '../../config/DatabaseSource'; // Adjust path as needed

interface ModuleAttributes {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ModuleCreationAttributes extends Optional<ModuleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Module extends Model<ModuleAttributes, ModuleCreationAttributes> implements ModuleAttributes {
  public id!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Module.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
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
    modelName: 'Module',
    tableName: 'modules',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  }
);

export default Module;