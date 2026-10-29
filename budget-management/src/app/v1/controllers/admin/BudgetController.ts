import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../../utils/general/ResponseUtils";
import {
  adminBudgetValidation,
  budgetListValidation,
  statusBudgetValidation,
} from "../../validators/BudgetValidation";
import AppDataSource from "../../../../config/DatabaseSource";
import {
  executeAddBudget,
  executeGetBudgetData,
  executeGetBudgetDetail,
  executeGetBudgetList,
  executeGetBudgetSummary,
  executeStatusBudget,
} from "../../../respository/admin/BudgetRepository";
import { azureStorageService } from "../../../utils/general/AzureStorageUtils";
import { deleteAzureFiles } from "../../../services/FileService";
import fs from "fs";
import { parseExcelBudgets } from "../../../services/imports/BudgetImportService";

// ============== Add Budget Api: ==============
export const addBudget = async (req: Request, res: Response): Promise<void> => {
  const processedBody = { ...req.body };
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "user authentication required",
      statusCode: 401,
      error: "unauthorized",
    });
    return;
  }
  if (typeof processedBody.budget_items === "string") {
    try {
      processedBody.budget_items = JSON.parse(processedBody.budget_items);
    } catch (e) {
      errorResponse(res, {
        message: "Invalid budget_items format. Must be valid JSON.",
        statusCode: 400,
      });
      return;
    }
  }
  if (typeof processedBody.attachment_files === "string") {
    try {
      processedBody.attachment_files = JSON.parse(
        processedBody.attachment_files
      );
    } catch (e) {
      processedBody.attachment_files = [];
    }
  }
  const transaction = await AppDataSource.transaction();
  try {
    const { error } = adminBudgetValidation.validate(processedBody);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    const result = await executeAddBudget(processedBody, user, transaction);
    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result?.error,
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
    await transaction.rollback();
    deleteAzureFiles(processedBody.attachment_files);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Add Budget Data.",
      error: err,
    });
  }
};

// ============== Get Budget List Api: ==============
export const getBudgetList = async (
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
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    query: req.query.query as string,
    queryKey: req.query.queryKey as string,
    status: req.query.status ? Array.isArray(req.query.status) ? req.query.status : (req.query.status as string).split(",") : undefined,
    organization_id: req.query.organization_id as string,
    category_id: req.query.category_id as string,
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
    cycle: req.query.cycle as string,
    initiator: req.query.initiator as string,
  };

  const { error } = budgetListValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  try {
    const result = await executeGetBudgetList(requestData, user);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result?.error,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Fetch Budget Data List.",
      error: err,
    });
  }
};

// ============== Get Budget Detail Api: ==============
export const getBudgetDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  const requestData = {
    organization_id: user.organization_id,
    budget_id: req.params.budget_id,
    token: token,
  };
  try {
    const result = await executeGetBudgetDetail(requestData);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result?.error,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Fetch Budget Data.",
      error: err,
    });
  }
};

// ============ Get Budget Data Api: ===================

export const getBudgetData = async (
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
  const {
    org_category_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
  } = req.params;

  const requestData = {
    organization_id: user.organization_id,
    org_category_id,
    subsidiary_id,
    subsidiary_branch_id,
    branch_department_id,
  };
  try {
    const result = await executeGetBudgetData(requestData);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result?.error,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to Fetch Budget Data.",
      error: err,
    });
  }
};

// ================ STATUS Budget Api: =============
export const statusBudget = async (
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
    organization_id: user.organization_id,
    budget_id: req.params.budget_id,
    status: req.body.status,
    updated_by: req.body.updated_by,
  };
  const { error } = statusBudgetValidation.validate(requestData);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  try {
    const result = await executeStatusBudget(requestData);
    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result?.error,
      });
      return;
    }
    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update Budget status.",
      error: err,
    });
  }
};

// ============== Bulk Upload Budget Api: ==============
export const bulkUploadBudget = async (
  req: Request,
  res: Response
): Promise<void> => {
  const file = req.file;
  const user = (req as any).user;

  if (!file) {
    errorResponse(res, {
      statusCode: 400,
      message: "Excel file required",
    });
    return;
  }

  try {
    const groupedBudgets = parseExcelBudgets(file.path, user.organization_id);

    const transaction = await AppDataSource.transaction();

    try {
      const results: any[] = [];

      for (const key in groupedBudgets) {
        const payload = groupedBudgets[key];
        const validated = await executeAddBudget(payload, user, transaction);

        if (!validated.success) {
          await transaction.rollback();
          errorResponse(res, {
            statusCode: validated.statusCode,
            message: validated.message,
            error: validated.error,
          });
        }

        results.push(validated.data);
      }

      await transaction.commit();

      successResponse(res, {
        statusCode: 201,
        message: "Budgets uploaded successfully",
        data: results,
      });
    } catch (err) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: 500,
        message: "Bulk budget upload failed",
        error: err,
      });
    }
  } catch (error) {
    errorResponse(res, {
      statusCode: 500,
      message: "Error parsing Excel",
      error,
    });
  } finally {
    fs.unlinkSync(file.path);
  }
};

export const deleteBudgetFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fileUrl = req.query.fileUrl as string;

    if (!fileUrl) {
      res.status(400).json({ message: "fileUrl is required as query param." });
    }

    const url = new URL(fileUrl);
    const blobName = decodeURIComponent(
      url.pathname.replace(/^\/procurecentro\//, "")
    );

    await azureStorageService.deleteFile(blobName);

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
  }
};

export const getBudgetSummary = async (
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

  try {
    const result = await executeGetBudgetSummary(user);

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
        error: result.error,
      });
      return;
    }

    successResponse(res, {
      statusCode: 200,
      message: "Budget summary fetched successfully",
      data: result.data,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to fetch budget summary.",
      error: err,
    });
  }
};
