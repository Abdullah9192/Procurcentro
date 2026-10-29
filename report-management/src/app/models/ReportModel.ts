import { Model, DataTypes, Optional } from "sequelize";
import AppDataSource from "../../config/DatabaseSource";
import {
  reportFrequencies,
  reportFrequenciesList,
  reportTypes,
  reportTypesList,
  reportStatuses,
  reportStatusesList,
  weekDaysList,
  weekDays,
} from "../utils/constants/index";
import { report } from "process";

export interface ReportAttributes {
  id: string;
  subsidiary_id: string | null;
  name: string;
  description: string;
  is_scheduled: boolean;
  report_frequency: string | null;
  frequency_day: string | null;
  frequency_time: string;
  date_format: string;
  date_decimal_symbol: string;
  report_type: string;
  report_columns: Array<string>;
  filter_start_date: Date;
  filter_end_date: Date;
  report_status: string;
  min_price: number;
  max_price: number;
  created_by: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportCreationAttributes
  extends Optional<
    ReportAttributes,
    "id" | "subsidiary_id" | "created_by" | "createdAt" | "updatedAt"
  > {}

class ReportsModel
  extends Model<ReportAttributes, ReportCreationAttributes>
  implements ReportAttributes
{
  public id!: string;
  public subsidiary_id!: string | null;
  public name!: string;
  public description!: string;
  public is_scheduled: boolean;
  public report_frequency:
    | (typeof reportFrequencies)[keyof typeof reportFrequencies]
    | null;
  public frequency_day: (typeof weekDays)[keyof typeof weekDays] | null;
  public frequency_time: string;
  public date_format: string;
  public date_decimal_symbol: string;
  public report_type: (typeof reportTypes)[keyof typeof reportTypes];
  public report_columns: Array<string>;
  public filter_start_date: Date;
  public filter_end_date: Date;
  public report_status: (typeof reportStatuses)[keyof typeof reportStatuses];
  public min_price: number;
  public max_price: number;
  public created_by: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ReportsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subsidiary_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    report_frequency: {
      type: DataTypes.ENUM(...reportFrequenciesList),
      allowNull: true,
    },
    frequency_day: {
      type: DataTypes.ENUM(...weekDaysList),
      allowNull: true,
    },
    frequency_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_format: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_decimal_symbol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    report_type: {
      type: DataTypes.ENUM(...reportTypesList),
      allowNull: false,
    },
    report_columns: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    filter_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    filter_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    min_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    max_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    report_status: {
      type: DataTypes.ENUM(...reportStatusesList),
      allowNull: true,
      defaultValue: reportStatuses.Draft,
    },
    created_by: {
      type: DataTypes.UUID,
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
    tableName: "reports",
    timestamps: true,
  }
);

export default ReportsModel;
