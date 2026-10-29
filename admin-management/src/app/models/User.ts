import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import OrgRole from "./OrgRole";
import Organization from "./Organization";

interface UserAttributes {
  id: string;
  user_id_no: string | null;
  invite_token: string | null;
  name: string;
  email: string;
  login_count: number | null;
  password: string;
  country: string | null;
  is_email_verified: boolean;
  is_supplier_capable: boolean | null;
  supplier_status: string | null;
  supplier_status_reason: string | null;
  supplier_approval_type:
  | "profile_update"
  | "new_vendor_registration"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "suspended"
  | "black_list"
  | "rectification"
  | null;
  google_id: string | null;
  microsoft_id: string | null;
  is_owner: boolean;
  user_type: "employee" | "admin" | "vendor";
  org_role_id: string | null;
  organization_id: string | null;
  email_verification_token: string | null;
  email_verification_expires: Date | null;
  reset_password_token: string | null;
  reset_password_expires: Date | null;
  subsidiary_branch_id: string | null;
  branch_department_id: string | null;
  subsidiary_id: string | null;
  is_head_department: boolean;
  googleaccesstoken: string | null;
  googlerefreshtoken: string | null;
  microsoftaccesstoken: string | null;
  microsoftrefreshtoken: string | null;
  onboard_completed: boolean;
  stepper: number;
  is_active: boolean;
  created_by: string | null;
  message: string | null;
  createdAt: Date;
  login_time: Date | null;
  updatedAt: Date;
}

export interface UserWithRelations extends UserAttributes {
  organization?: Organization;
  org_role?: OrgRole;
  creator?: User;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | "id"
    | "user_id_no"
    | "invite_token"
    | "country"
    | "google_id"
    | "microsoft_id"
    | "org_role_id"
    | "password"
    | "organization_id"
    | "is_owner"
    | "user_type"
    | "is_active"
    | "email_verification_token"
    | "email_verification_expires"
    | "reset_password_token"
    | "reset_password_expires"
    | "subsidiary_branch_id"
    | "branch_department_id"
    | "subsidiary_id"
    | "is_head_department"
    | "onboard_completed"
    | "stepper"
    | "googleaccesstoken"
    | "googlerefreshtoken"
    | "microsoftaccesstoken"
    | "microsoftrefreshtoken"
    | "created_by"
    | "message"
    | "createdAt"
    | "login_time"
    | "updatedAt"
    | "is_supplier_capable"
    | "supplier_status"
    | "supplier_status_reason"
    | "supplier_approval_type"
  > { }

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public user_id_no!: string | null;
  public invite_token!: string | null;
  public name!: string;
  public login_count!: number | null;
  public email!: string;
  public password!: string;
  public country!: string | null;
  public is_email_verified!: boolean;
  public is_supplier_capable!: boolean | null;
  public supplier_status!: string | null;
  public supplier_status_reason!: string | null;
  public supplier_approval_type!:
    | "profile_update"
    | "new_vendor_registration"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "suspended"
    | "black_list"
    | "rectification"
    | null;
  public google_id!: string | null;
  public microsoft_id!: string | null;
  public is_owner!: boolean;
  public user_type!: "employee" | "admin" | "vendor";
  public org_role_id!: string | null;
  public organization_id!: string | null;
  public email_verification_token!: string | null;
  public email_verification_expires!: Date | null;
  public reset_password_token!: string | null;
  public reset_password_expires!: Date | null;
  public subsidiary_branch_id!: string | null;
  public branch_department_id!: string | null;
  public subsidiary_id!: string | null;
  public is_head_department!: boolean;
  public googleaccesstoken: string | null;
  public googlerefreshtoken: string | null;
  public microsoftaccesstoken: string | null;
  public microsoftrefreshtoken: string | null;
  public onboard_completed!: boolean;
  public stepper!: number;
  public is_active!: boolean;
  public created_by!: string | null;
  public message!: string | null;
  public readonly createdAt!: Date;
  public readonly login_time!: Date;
  public readonly updatedAt!: Date;

  public readonly org_role?: OrgRole;
  public readonly organization?: Organization;
  public readonly creator?: User;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invite_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleaccesstoken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googlerefreshtoken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    login_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    microsoftaccesstoken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    login_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    microsoftrefreshtoken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_supplier_capable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    supplier_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplier_status_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplier_approval_type: {
      type: DataTypes.ENUM(
        "profile_update",
        "registration",
        "black_list",
        "suspended",
        "rectification",
        "approved",
        "rejected",
        "pending_approval"
      ),
      allowNull: true,
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    microsoft_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    is_owner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_type: {
      type: DataTypes.ENUM("employee", "admin", "vendor"),
      allowNull: false,
      defaultValue: "employee",
    },
    org_role_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "org_roles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "organizations", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    email_verification_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subsidiary_branch_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    branch_department_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_head_department: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    onboard_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    stepper: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      { fields: ["email"], unique: true, name: "users_email_unique" },
      { fields: ["org_role_id"], name: "users_org_role_id" },
      { fields: ["organization_id"], name: "users_organization_id" },
      { fields: ["created_by"], name: "users_created_by" },
      { fields: ["google_id"], name: "users_google_id" },
      { fields: ["microsoft_id"], name: "users_microsoft_id" },
    ],
  }
);

export default User;
