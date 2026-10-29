import { Request, Response } from "express";
import { Transaction, Op } from "sequelize";
import AppDataSource from "../../../config/DatabaseSource";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { addExternalServiceRequisitionValidation, addInternalServiceRequisitionValidation, updateExternalServiceRequisitionValidation, updateInternalServiceRequisitionValidation } from "../validators/ServiceRequisitionValidation";
import { executeCreateExternalServiceRequisition, executeGetExternalServiceRequisitions, executeGetExternalServiceRequisition, executeDeleteExternalServiceRequisition, executeUpdateExternalServiceRequisition, executeUpdateInternalServiceRequisition, executeGetInternalServiceRequisition, executeCreateInternalServiceRequisition } from "../../respository/ServiceRequisitionRepository";


// Create External Requisition
export const createExternalServiceRequisition = async (
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
    throw new Error("Authorization token is required");
  }

  try {
    const { error } = addExternalServiceRequisitionValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    console.log("internal request req.body  ==>>>>>>>>", req.body);
    const transaction: Transaction = await AppDataSource.transaction();
    try {
      const result = await executeCreateExternalServiceRequisition(
        req.body,
        user,
        token,
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
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: err?.message || "Failed to Create External Requisition.",
      error: err?.message || String(err),
    });
  }
};


export const getExternalServiceRequisitionList = async (req: Request, res: Response) => {
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
    subsidiary_id: req.query.subsidiary_id ? req.query.subsidiary_id : undefined,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    search: req.query.search ? req.query.search as string : undefined,
  };


  try {
    const result = await executeGetExternalServiceRequisitions(requestData);
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
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message: res.statusMessage || "Failed to fetch the requisition List",
    });
  }
};

export const getExternalServiceRequisition = async (req: Request, res: Response): Promise<void> => {
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
    const result = await executeGetExternalServiceRequisition(id, user?.organization_id);
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


// ===== Delete Requisition:
export const deleteExternalServiceRequisition = async (
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
  const { id } = req.params;
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeDeleteExternalServiceRequisition(id, user?.organization_id, transaction);
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
  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to delete requisition.",
      error: err,
    });
  }
};


// =========== update Product :
export const updateExternalServiceRequisition = async (req: Request, res: Response): Promise<void> => {
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

  const { error, value } = updateExternalServiceRequisitionValidation.validate(payload, { convert: true });
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeUpdateExternalServiceRequisition(id, value, user, transaction);
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



export const createInternalServiceRequisition = async (
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
    throw new Error("Authorization token is required");
  }

  try {
    const { error } = addInternalServiceRequisitionValidation.validate(req.body);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    const transaction: Transaction = await AppDataSource.transaction();
    try {
      const result = await executeCreateInternalServiceRequisition(
        req.body,
        user,
        token,
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
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Create Internal Requisition.",
      error: err,
    });
  }
};

export const updateInternalServiceRequisition = async (req: Request, res: Response): Promise<void> => {
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

  const { error, value } = updateInternalServiceRequisitionValidation.validate(payload, { convert: true });
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeUpdateInternalServiceRequisition(id, value, user, transaction);
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
      message: result.message
    });
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: error?.message || "Failed to update Requisition.",
    });
  }
};

export const getInternalServiceRequisition = async (req: Request, res: Response): Promise<void> => {
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
    const result = await executeGetInternalServiceRequisition(id, user?.organization_id);
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