import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/DatabaseSource";

export interface BackofficeNotificationAttributes {
  id: string;
  title: string;
  trigger_action: string;
  mode: string;
  start_date: string;
  end_date: string;
  time: string;
  message: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BackofficeNotificationCreationAttributes
  extends Partial<BackofficeNotificationAttributes> {}

export class BackofficeNotification extends Model<
  BackofficeNotificationAttributes,
  BackofficeNotificationCreationAttributes
> implements BackofficeNotificationAttributes {
  public id!: string;
  public title!: string;
  public trigger_action!: string;
  public mode!: string;
  public start_date!: string;
  public end_date!: string;
  public time!: string;
  public message!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

BackofficeNotification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trigger_action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
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
    sequelize,
    tableName: "backoffice_notifications",
    timestamps: false,
  }
);

export default BackofficeNotification;
