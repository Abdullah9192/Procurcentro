import { Model, FindOptions } from "sequelize";
import AuditLogModel from "../models/AuditLogs";

interface PaginateOptions extends Omit<FindOptions, "limit" | "offset"> {
  page?: number;
  limit?: number;
}

interface PaginateResult<T> {
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
  limit: number;
}

export const paginate = async <T extends Model>(
  model: {
    findAndCountAll(
      options: FindOptions
    ): Promise<{ count: number; rows: T[] }>;
  },
  {
    where = {},
    include = [],
    order = [["createdAt", "DESC"]],
    page = 1,
    limit = 20,
  }: PaginateOptions = {}
): Promise<PaginateResult<T>> => {
  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    where,
    include,
    order,
    limit,
    offset,
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: rows,
    limit,
  };
};

export async function getNextLogIdForOrganization(
  organizationId: string
): Promise<string> {
  const lastLog = await AuditLogModel.findOne({
    where: { organization_id: organizationId },
    order: [["createdAt", "DESC"]],
  });

  if (!lastLog || !lastLog.log_id) {
    return "LOG001"; // default starting value
  }

  const currentLogId = lastLog.log_id;

  // Ensure it always starts with LOG
  const withoutPrefix = currentLogId.startsWith("LOG")
    ? currentLogId.slice(3)
    : currentLogId;

  // Find last numeric sequence
  const match = withoutPrefix.match(/(\d+)(?!.*\d)/);

  if (!match) {
    // if no number found, append default
    return "LOG" + withoutPrefix + "001";
  }

  const numberPart = match[1];
  const prefix = withoutPrefix.slice(0, match.index); // text before number
  const nextNumber = String(parseInt(numberPart, 10) + 1).padStart(
    numberPart.length,
    "0"
  );

  return "LOG" + prefix + nextNumber;
}
