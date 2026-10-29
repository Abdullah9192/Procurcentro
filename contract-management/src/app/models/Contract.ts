import { DataTypes, Model, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import ContractSigner from "./ContractSigner";

interface ContractAttributes {
  id: string;

  contract_status?: "draft" | "signed_and_active" | "signed_and_non_active";

  status: "draft" | "approved" | "pending_approval" | "rejected" | "revision";

  contract_type: string;
  document?: string | null;
  signed_document?: string | null;
  title: string;
  description: string;

  author_id: string;
  author_name: string;
  author_department_id: string;
  author_department: string;

  counter_party: string;
  counter_party_id: string;
  counter_party_primary_contact: string;

  contract_term: "definite" | "indefinite";
  contract_effect_type: string;

  effective_date?: Date | null;
  end_date: Date;

  termination_notice_period?: number | null;
  is_contract_renewable?: boolean | null;
  expiration_reminder?: number | null;

  initiated_by: "organization" | "external_party";
  organization_id: string;

  renewal_type?: string | null;
  renewal_term?: number | null;
  non_renew_notice_period?: number | null;

  template_id?: string | null;
  boldsign_document_id?: string | null;
  boldsign_status?: "draft" | "sent" | "in_progress" | "completed" | "declined";

  created_at?: Date;
  updated_at?: Date;
}

type ContractCreationAttributes = Optional<
  ContractAttributes,
  | "id"
  | "document"
  | "signed_document"
  | "effective_date"
  | "termination_notice_period"
  | "is_contract_renewable"
  | "expiration_reminder"
  | "renewal_type"
  | "renewal_term"
  | "non_renew_notice_period"
  | "template_id"
  | "boldsign_document_id"
  | "boldsign_status"
  | "created_at"
  | "updated_at"
>;

class Contract
  extends Model<ContractAttributes, ContractCreationAttributes>
  implements ContractAttributes
{
  public id!: string;

  public contract_status?:
    | "draft"
    | "signed_and_active"
    | "signed_and_non_active";

  public status!:
    | "draft"
    | "approved"
    | "pending_approval"
    | "rejected"
    | "revision";

  public contract_type!: string;
  public document?: string | null;
  public signed_document?: string | null;
  public title!: string;
  public description!: string;

  public author_id!: string;
  public author_name!: string;
  public author_department_id!: string;
  public author_department!: string;

  public counter_party!: string;
  public counter_party_id!: string;
  public counter_party_primary_contact!: string;

  public contract_term!: "definite" | "indefinite";
  public contract_effect_type!: string;

  public effective_date?: Date | null;
  public end_date!: Date;

  public termination_notice_period?: number | null;
  public is_contract_renewable?: boolean | null;
  public expiration_reminder?: number | null;

  public initiated_by!: "organization" | "external_party";
  public organization_id!: string;

  public renewal_type?: string | null;
  public renewal_term?: number | null;
  public non_renew_notice_period?: number | null;

  public template_id?: string | null;
  public boldsign_document_id?: string | null;
  public boldsign_status?:
    | "draft"
    | "sent"
    | "in_progress"
    | "completed"
    | "declined";

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public readonly signers?: ContractSigner[];
}

Contract.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    contract_status: {
      type: DataTypes.ENUM(
        "draft",
        "signed_and_active",
        "signed_and_non_active",
      ),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "draft",
        "approved",
        "pending_approval",
        "rejected",
        "revision",
      ),
      allowNull: false,
    },

    contract_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    document: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    signed_document: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    author_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    author_department_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    author_department: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    counter_party: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    counter_party_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    counter_party_primary_contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contract_term: {
      type: DataTypes.ENUM("definite", "indefinite"),
      allowNull: false,
    },

    contract_effect_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    effective_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    termination_notice_period: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    is_contract_renewable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    expiration_reminder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    initiated_by: {
      type: DataTypes.ENUM("organization", "external_party"),
      allowNull: true,
    },

    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    renewal_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    renewal_term: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    non_renew_notice_period: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    template_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    boldsign_document_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    boldsign_status: {
      type: DataTypes.ENUM(
        "draft",
        "sent",
        "in_progress",
        "completed",
        "declined",
      ),
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
    tableName: "contracts",
    modelName: "Contract",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Contract;
