import { Request, Response } from "express";
import { createCredit, deleteCredit, getAllCredits, getCreditById, updateCredit } from "../../../respository/credit-value/credit";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";


// Create Credit
export const createCreditController = async (req: Request, res: Response) => {
  try {
    const { document, credit } = req.body;
    const result = await createCredit({ document, credit });

    return successResponse(res, {
      statusCode: 201,
      message: "Credit created successfully",
      data: result.credit,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to create credit",
    });
  }
};

// Get All Credits
export const getAllCreditsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllCredits(page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: "Credits fetched successfully",
      data: result.credits,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to fetch credits",
    });
  }
};


// Get Credit by ID
export const getCreditByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getCreditById(id);

    return successResponse(res, {
      statusCode: 200,
      message: "Credit fetched successfully",
      data: result.credit,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to fetch credit",
    });
  }
};

// Update Credit
export const updateCreditController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { document, credit } = req.body;
    const result = await updateCredit(id, { document, credit });

    return successResponse(res, {
      statusCode: 200,
      message: "Credit updated successfully",
      data: result.credit,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to update credit",
    });
  }
};

// Delete Credit
export const deleteCreditController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteCredit(id);

    return successResponse(res, {
      statusCode: 200,
      message: "Credit deleted successfully",
      data: { deleted_id: result.deleted_id },
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || "Failed to delete credit",
    });
  }
};
