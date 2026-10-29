import {
  Model,
  DataTypes,
  Optional,
} from "sequelize";
import AppDataSource from "../../config/DatabaseSource";

// ---- ENUMS ----
export enum SubscriptionPlan {
  STARTER = "starter",
  ENTERPRISE = "enterprise",
  PROFESSIONAL = "professional",
}

export enum PlanType {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

// ---- ATTRIBUTES ----
interface SubscriptionAttributes {
  id: string;
  // organization_id: string;
  subscription_plan: SubscriptionPlan;
  description: string;
  plan_type: PlanType;
  amount: number;
  no_of_users: number;
  renewal: boolean;
  features: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

// ---- CREATION ATTRIBUTES ----
type SubscriptionCreationAttributes = Optional<
  SubscriptionAttributes,
  "id" | "created_at" | "updated_at"
>;

class Subscription
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes {
  public id!: string;
  // public organization_id!: string;
  public subscription_plan!: SubscriptionPlan;
  public description!: string;
  public plan_type!: PlanType;
  public amount!: number;
  public renewal!: boolean;
  public no_of_users!: number;
  public features!: Record<string, any>;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // organization_id: {
    //   type: DataTypes.UUID,
    //   defaultValue: DataTypes.UUIDV4,
    //   allowNull: false,
    // },

    subscription_plan: {
      type: DataTypes.ENUM(...Object.values(SubscriptionPlan)),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true, // optional, can be required if needed
    },

    plan_type: {
      type: DataTypes.ENUM(...Object.values(PlanType)),
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    no_of_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    features: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    renewal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: "Subscription",
    tableName: "subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Subscription;