import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/ResponseUtils";
import ContractType from "../../models/ContractType";
import { contractTypeSchema } from "../validators/ContractTypeValidation";
import {
  getOrgCategoryById,
  getUserById,
} from "../../../grpc/clients/AdminGrpcClient";

// ➕ CREATE
export const addContractType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error } = contractTypeSchema.validate(req.body);
    if (error) {
      errorResponse(res, { statusCode: 400, message: error.message });
      return;
    }

    const contractType = await ContractType.create(req.body);

    successResponse(res, {
      statusCode: 201,
      message: "Contract type created successfully",
      data: contractType,
    });
  } catch (err: any) {
    console.error("Error creating contract type:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// 📄 GET ALL
export const getAllContractTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const { rows, count } = await ContractType.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    // Fetch related user data for each record
    const recordsWithUsers = await Promise.all(
      rows.map(async (contractType) => {
        const createdByUser = contractType.created_by
          ? await getUserById(String(contractType.created_by))
          : null;

        return {
          ...contractType.toJSON(),
          created_by_user: createdByUser,
        };
      })
    );

    const totalPages = Math.ceil(count / limit);

    successResponse(res, {
      statusCode: 200,
      message: "Contract types fetched successfully",
      data: {
        records: recordsWithUsers,
        pagination: {
          totalRecords: count,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (err: any) {
    console.error("Error fetching contract types:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// 🔍 GET BY ID
export const getContractTypeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contractType = await ContractType.findByPk(id);

    if (!contractType) {
      errorResponse(res, {
        statusCode: 404,
        message: "Contract type not found",
      });
      return;
    }
    if (!contractType.org_category_id || !contractType.created_by) {
      errorResponse(res, {
        statusCode: 400,
        message: "Invalid data: missing org_category_id or created_by",
      });
      return;
    }
    let orgCategory: any = null;
    let createdByUser: any = null;
    try {
      [orgCategory, createdByUser] = await Promise.all([
        getOrgCategoryById(contractType.org_category_id),
        getUserById(contractType.created_by),
      ]);
    } catch (grpcErr: any) {
      console.log("Error fetching orgCategory or createdByUser:", grpcErr);
    }

    successResponse(res, {
      statusCode: 200,
      message: "Contract type fetched successfully",
      data: {
        ...contractType.toJSON(),
        org_category: orgCategory,
        created_by_user: createdByUser,
      },
    });
  } catch (err: any) {
    console.error("Error fetching contract type:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// ✏️ UPDATE
export const updateContractType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = contractTypeSchema.validate(req.body, {
      allowUnknown: true,
    });
    if (error) {
      errorResponse(res, { statusCode: 400, message: error.message });
      return;
    }

    const contractType = await ContractType.findByPk(id);
    if (!contractType) {
      errorResponse(res, {
        statusCode: 404,
        message: "Contract type not found",
      });
      return;
    }

    await contractType.update(req.body);

    successResponse(res, {
      statusCode: 200,
      message: "Contract type updated successfully",
      data: contractType,
    });
  } catch (err: any) {
    console.error("Error updating contract type:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// ❌ DELETE
export const deleteContractType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contractType = await ContractType.findByPk(id);

    if (!contractType) {
      errorResponse(res, {
        statusCode: 404,
        message: "Contract type not found",
      });
      return;
    }

    await contractType.destroy();

    successResponse(res, {
      statusCode: 200,
      message: "Contract type deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting contract type:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};
