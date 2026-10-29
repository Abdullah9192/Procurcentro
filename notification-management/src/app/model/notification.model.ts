import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

interface NotificationAttributes {
  id: string;
  sender_id: string;
  receiver_id: string;
  organization_id: string;
  subsidiary_id?: string | null;
  notification_type: string;
  notification_module: string;
  message: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Optional attributes for creation
interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    "id" | "subsidiary_id" | "is_read" | "created_at" | "updated_at"
  > {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: string;
  public sender_id!: string;
  public receiver_id!: string;
  public organization_id!: string;
  public subsidiary_id!: string | null;
  public notification_type!: string;
  public notification_module!: string;
  public message!: string;
  public is_read!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notification_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notification_module: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: AppDataSource,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Notification;
