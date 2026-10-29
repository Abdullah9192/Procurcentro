import { Request, Response } from "express";
import AppDataSource from "../../../config/DatabaseSource";
import {
  errorResponse,
  successResponse,
} from "../../utils/general/ResponseUtils";
import { executeConvertPurchaseOrderInInvoice, executeGetInvoices } from "../../respository/InvoiceRepository";
import { getInvoicesValidation } from "../validators/InvoiceValidation";

// convertPurchaseOrderInInvoice
export const convertPurchaseOrderInInvoice = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  const purchaseOrderId = req.params.purchase_order_id;
  if (!user?.id || !user?.organization_id || !token) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeConvertPurchaseOrderInInvoice(
        purchaseOrderId, 
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
  } catch (error: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to create purchase order.",
      error: error.message,
    });
  }
};

// getOrders
export const getInvoices = async (
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
  const requestData = {
    organization_id: user?.organization_id,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    subsidiary_id: req.query.subsidiary_id ? req.query.subsidiary_id : undefined,
    subsidiary_branch_id: req.query.subsidiary_branch_id ? req.query.subsidiary_branch_id : undefined,
    branch_department_id: req.query.branch_department_id ? req.query.branch_department_id : undefined,
    status: req.query.status ? req.query.status : undefined,
    search: req.query.search ? req.query.search as string : undefined,
  };
  const { error } = getInvoicesValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  try {
    const result = await executeGetInvoices(requestData);
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
    console.error('Error in get invoices:', err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to get invoices.",
      error: err,
    });
  }
};