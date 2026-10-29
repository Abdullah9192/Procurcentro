import { Request, Response } from "express";
import { Transaction, Op } from "sequelize";
import AppDataSource from "../../../config/DatabaseSource";
import {
  externalRequisitionValidation,
  getRequisitionsValidation,
  getRequisitionValidation,
  internalRequisitionValidation,
  updateExternalRequisitionValidation,
  updateInternalRequisitionValidation,
  updateRequisitionStatusValidation,
} from "../validators/RequisitionValidation";
import {
  executeCreateExternalRequisition,
  executeCreateInternalRequisition,
  executeGetExternalItemRequisition,
  executeGetInternalItemRequisition,
  executeGetRequisitions,
  executeUpdateExternalItemRequisition,
  executeUpdateInternalItemRequisition,
  executeUpdateRequisitionStatus,
} from "../../respository/RequisitionRepository";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";

// const isRequestIdUnique = async (
//     requestId: string,
//     organizationId: string,
//     excludeId?: string
// ): Promise<boolean> => {
//     const whereClause: any = {
//         request_id: requestId,
//         organization_id: organizationId
//     };

//     if (excludeId) {
//         whereClause.id = { [Op.ne]: excludeId };
//     }

//     const existingRequisition = await requisitionService.findOne({
//         where: whereClause
//     });

//     return !existingRequisition;
// };

const parseJsonFields = (body: any) => {
  if (typeof body.line_items === "string") {
    try {
      body.line_items = JSON.parse(body.line_items);
    } catch (error) {
      throw new Error("Invalid JSON format for line_items");
    }
  }

  if (Array.isArray(body.line_items)) {
    body.line_items = body.line_items.map((item: any) => {
      if (typeof item.attachments === "string") {
        try {
          item.attachments = JSON.parse(item.attachments);
        } catch (error) {
          throw new Error("Invalid JSON format for attachments");
        }
      }
      return item;
    });
  }

  return body;
};

// Create Internal Requisition
export const createInternalRequisition = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("=== START createInternalRequisition ===");

  const user = (req as any).user;
  console.log("User:", user);

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    console.log("Auth failed: Invalid user");
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token:", token);

  if (!token) {
    console.log("Missing token");
    throw new Error("Authorization token is required");
  }

  try {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const { error } = internalRequisitionValidation.validate(req.body);
    if (error) {
      console.log("Validation Error:", error.details);
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }

    console.log("Validation Passed");

    const transaction: Transaction = await AppDataSource.transaction();
    console.log("Transaction started");

    try {
      const result = await executeCreateInternalRequisition(
        req.body,
        user,
        token,
        transaction
      );

      console.log("Service Result:", result);

      if (!result.success) {
        console.log("Service failed, rolling back...");
        await transaction.rollback();

        errorResponse(res, {
          statusCode: result.statusCode,
          message: result.message,
          error: result.error, // expose exact error
        });
        return;
      }

      console.log("Committing transaction...");
      await transaction.commit();

      successResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      });
    } catch (err) {
      console.log("Transaction Error:", err);
      await transaction.rollback();
      throw err;
    }
  } catch (err: any) {
    console.log("Controller Catch Error:", err);
    console.log("Error Stack:", err?.stack);

    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create Internal Requisition.",
      error: err?.message || err,
    });
  }
};


// Create External Requisition
export const createExternalRequisition = async (
  req: Request,
  res: Response
): Promise<void> => {

  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    errorResponse(res, {
      message: "Token is  required",
      statusCode: 401,
    });
    return;
  }
  try {
    const { error, value } = externalRequisitionValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: "Validation failed",
        error: error.details.map((d) => d.message),
      });
      return
    }
    const transaction: Transaction = await AppDataSource.transaction();
    try {
      const result = await executeCreateExternalRequisition(
        value,
        user,
        token,
        transaction
      );
      if (!result.success) {
        await transaction.rollback();
        errorResponse(res, {
          statusCode: result.statusCode || 400,
          message: result.message,
          error: result.error || null,
        });
        return
      }
      await transaction.commit();
      successResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        data: result.data,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err: any) {
    console.error("External Requisition Error:", err?.response?.data || err);
    errorResponse(res, {
      statusCode: err?.response?.status || err?.statusCode || 500,
      message:
        err?.response?.data?.message ||
        err?.message ||
        "Failed to Create External Requisition.",
      error: err?.response?.data?.error || null,
    });
    return
  }
};

// updateRequisitionStatus
export const updateRequisitionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const id = req.params.id;

  const { error } = updateRequisitionStatusValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateRequisitionStatus(
      id,
      req.body,
      user,
      transaction
    );
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Update Requisition Status.",
      error: err.original.message,
    });
  }
};

// Get All Requisitions
export const getRequisitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
      errorResponse(res, {
        message: "User authentication required",
        statusCode: 401,
      });
      return;
    }
    const requestData = {
      organization_id: user?.organization_id,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      subsidiary_id: req.query.subsidiary_id
        ? req.query.subsidiary_id
        : undefined,
      subsidiary_branch_id: req.query.subsidiary_branch_id
        ? req.query.subsidiary_branch_id
        : undefined,
      branch_department_id: req.query.branch_department_id
        ? req.query.branch_department_id
        : undefined,
      search: req.query.search ? (req.query.search as string) : undefined,
      status: req.query.status ? Array.isArray(req.query.status) ? req.query.status : (req.query.status as string).split(",") : undefined,
      type: req.query.type ? (req.query.type as string) : undefined,
      use_type: req.query.use_type ? (req.query.use_type as string) : undefined,
      requested_user: req.query.requested_user as string | undefined,
      from_date: req.query.from_date as string | undefined,
      to_date: req.query.to_date as string | undefined,
    };

    const { error } = getRequisitionsValidation.validate(requestData);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }


    const result = await executeGetRequisitions(requestData, user);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    console.error("Error in getRequisitions:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Retrieve Requisitions.",
      error: err,
    });
  }
};


export const updateInternalItemRequisition = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const { id } = req.params;
  const payload = req.body;

  if (!id) {
    errorResponse(res, {
      statusCode: 400,
      message: "Requisition ID is required",
    });
    return;
  }

  const { error, value } = updateInternalRequisitionValidation.validate(payload, { convert: true });
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeUpdateInternalItemRequisition(id, value, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: error?.message || "Failed to update Requisition.",
    });
  }
};

export const updateExternalItemRequisition = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
    });
    return;
  }

  const { id } = req.params;
  const payload = req.body;

  if (!id) {
    errorResponse(res, {
      statusCode: 400,
      message: "Requisition ID is required",
    });
    return;
  }

  const { error, value } = updateExternalRequisitionValidation.validate(payload, { convert: true });
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeUpdateExternalItemRequisition(id, value, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    await transaction.commit();
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: error?.message || "Failed to update Requisition.",
    });
  }
};


export const getExternalItemRequisition = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  try {
    const result = await executeGetExternalItemRequisition(id, user?.organization_id);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get Requisition detail.",
      error: err,
    });
  }
};

export const getInternalItemRequisition = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;

  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const { id } = req.params;
  try {
    const result = await executeGetInternalItemRequisition(id, user?.organization_id);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get Requisition detail.",
      error: err,
    });
  }
};