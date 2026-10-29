import {
  Model,
  ModelStatic,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
} from 'sequelize';

export class BaseService<M extends Model> {
  constructor(protected model: ModelStatic<M>) {}

  // Create a new record and return as plain object
  async create(data: any, options?: CreateOptions): Promise<any> {
    const record = await this.model.create(data, options);
    return record.get({ plain: true });
  }

  // Bulk create records and return as plain objects
  async bulkCreate(data: any[], options?: CreateOptions): Promise<any[]> {
    const records = await this.model.bulkCreate(data, options);
    return records.map((record) => record.get({ plain: true }));
  }

  // Find all records with optional query and return plain objects
  async findAll(options?: FindOptions): Promise<any[]> {
    const records = await this.model.findAll(options);
    return records.map((record) => record.get({ plain: true }));
  }

  // Find one record by ID and return plain object
  async findById(id: string | number, options?: FindOptions): Promise<any | null> {
    const record = await this.model.findByPk(id, options);
    return record ? record.get({ plain: true }) : null;
  }

  // Find one record with conditions and return plain object
  async findOne(options: FindOptions): Promise<any | null> {
    const record = await this.model.findOne(options);
    return record ? record.get({ plain: true }) : null;
  }

  // Update records and return updated records as plain objects
  async update(data: any, options: UpdateOptions): Promise<[number, any[]]> {
    const [count, records] = await this.model.update(data, {
      ...options,
      returning: true, // Return the updated records
    });
    return [count, records.map((record) => record.get({ plain: true }))];
  }

  // Delete records
  async delete(options: DestroyOptions): Promise<number> {
    return this.model.destroy(options);
  }

  // Count records
  async count(options?: FindOptions): Promise<number> {
    return this.model.count(options);
  }

  // Paginated results with plain objects
  async paginate({
    page = 1,
    limit = 10,
    options = {},
  }: {
    page?: number;
    limit?: number;
    options?: FindOptions;
  }): Promise<{ data: any[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const { rows, count: total } = await this.model.findAndCountAll({
      ...options,
      limit,
      offset,
    });

    return {
      data: rows.map((record) => record.get({ plain: true })),
      total,
      pages: Math.ceil(total / limit),
    };
  }
}
