import { Model, FindOptions } from "sequelize";

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
