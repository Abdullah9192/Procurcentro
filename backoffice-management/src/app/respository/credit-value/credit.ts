import BackofficeCredit from "../../models/backoffice-credit.entity";


export const createCredit = async ({ document, credit }: { document: string; credit: number }) => {
  if (!document) throw { statusCode: 400, message: "Document is required" };
  if (credit === undefined || credit === null) throw { statusCode: 400, message: "Credit is required" };

  const newCredit = await BackofficeCredit.create({ document, credit });
  return { credit: newCredit };
};

export const getAllCredits = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await BackofficeCredit.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    credits: rows,
    pagination: {
      total_records: count,
      total_pages: Math.ceil(count / limit),
      current_page: page,
      per_page: limit,
    },
  };
};


export const getCreditById = async (id: string) => {
  if (!id) throw { statusCode: 400, message: "Credit ID is required" };

  const credit = await BackofficeCredit.findByPk(id);
  if (!credit) throw { statusCode: 404, message: "Credit not found" };

  return { credit };
};

export const updateCredit = async (id: string, { document, credit }: { document?: string; credit?: number }) => {
  if (!id) throw { statusCode: 400, message: "Credit ID is required" };

  const creditRecord = await BackofficeCredit.findByPk(id);
  if (!creditRecord) throw { statusCode: 404, message: "Credit not found" };

  if (document !== undefined) creditRecord.document = document;
  if (credit !== undefined) creditRecord.credit = credit;

  await creditRecord.save();
  return { credit: creditRecord };
};

export const deleteCredit = async (id: string) => {
  if (!id) throw { statusCode: 400, message: "Credit ID is required" };

  const credit = await BackofficeCredit.findByPk(id);
  if (!credit) throw { statusCode: 404, message: "Credit not found" };

  await credit.destroy();
  return { deleted_id: id };
};
