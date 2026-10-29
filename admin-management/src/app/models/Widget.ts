import {
  Model,
  DataTypes,
  Optional,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import AppDataSource from '../../config/DatabaseSource';
import AdminDashboardWidget from './AdminDashboardWidget';

export interface WidgetAttributes {
  id: string;
  name: string;
  widget_type: 'counter' | 'charts' | 'todo' | 'custom';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

type WidgetCreationAttributes = Optional<
  WidgetAttributes,
  'id' | 'created_at' | 'is_active' | 'updated_at'
>;

class Widget extends Model<WidgetAttributes, WidgetCreationAttributes> implements WidgetAttributes {
  public id!: string;
  public name!: string;
  public widget_type!: 'counter' | 'charts' | 'todo' | 'custom';
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getAdminDashboardWidgets!: HasManyGetAssociationsMixin<AdminDashboardWidget>;
}

Widget.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    widget_type: {
      type: DataTypes.ENUM('counter', 'charts', 'todo', 'custom'),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'Widget',
    tableName: 'widgets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Widget;
