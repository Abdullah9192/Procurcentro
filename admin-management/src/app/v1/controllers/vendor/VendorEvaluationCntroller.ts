import { Request, Response } from "express";
import { getAllVendorEvaluations, updateVendorEvaluation } from "../../../respository/vendor/VendorEvaluationRepository";
import VendorEvaluation from "../../../models/VendorEvaluation";

export const getVendorEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organization_id } = req.params;

    const data = await getAllVendorEvaluations(organization_id);

    return void res.status(200).json({
      message: "Vendor evaluations fetched",
      data,
    });
  } catch (error) {
    return void res.status(500).json({ message: "Error", error });
  }
};

export const editVendorEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const data = await updateVendorEvaluation(id, req.body);

    return void res.status(200).json({
      message: "Vendor evaluation updated",
      data,
    });
  } catch (error) {
    return void res.status(500).json({ message: "Error", error });
  }
};

export const createVendorEvaluation = async (
  payload: any,
  options: any
) => {
  return await VendorEvaluation.create(payload, options);
};
