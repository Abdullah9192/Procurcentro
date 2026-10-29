import VendorEvaluation from "../../models/VendorEvaluation";

export const getAllVendorEvaluations = async (organization_id: string) => {
  return await VendorEvaluation.findAll({
    where: { organization_id },
    order: [['created_at', 'DESC']],
  });
};

export const updateVendorEvaluation = async (id: string, payload: any) => {
  await VendorEvaluation.update(payload, { where: { id } });
  return await VendorEvaluation.findByPk(id);
};
