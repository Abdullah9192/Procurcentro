import { Request, Response } from "express";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import {
  createSupplierSetupValidation,
  updateSupplierBankInfoValidation,
  updateSupplierClientReferenceValidation,
  updateSupplierContactValidation,
  updateSupplierInfoValidation,
  updateSupplierKycInfoValidation,
} from "../../validators/AuthValidation";
import AppDataSource from "../../../../config/DatabaseSource";
import {
  executeCreateSupplierSetupData,
  executeGetDocumentList,
  executeGetIndustryList,
  executeGetSupplierBankInfo,
  executeGetSupplierBasicInfo,
  executeGetSupplierClientReferences,
  executeGetSupplierContacts,
  executeGetSupplierContactsById,
  executeGetSupplierKycInfo,
  executeUpdateSupplierBankInfo,
  executeUpdateSupplierBasicInfo,
  executeUpdateSupplierClientReference,
  executeUpdateSupplierContact,
  executeUpdateSupplierKycInfo,
} from "../../../respository/setup/SetupRepository";
import SupplierDocument from "../../../models/SupplierDocument";
import { http } from "../../../services/AxiosClient";
import { service } from "../../../../config/EnvVariables";
export const uploadAzureFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileUrl = req.body?.file;

  if (!fileUrl) {
    errorResponse(res, {
      statusCode: 400,
      message: "No file provided.",
    });
    return;
  }

  try {
    successResponse(res, {
      statusCode: 200,
      message: "File uploaded successfully.",
      data: fileUrl,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload file.",
      error: err,
    });
  }
};

// createVendorSetupData
export const createSupplierSetupData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;

  const payload = req.body;

  const { error } = createSupplierSetupValidation.validate(payload.data);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeCreateSupplierSetupData(
      user,
      req.body.data,
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
    });
  } catch (err: any) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to add supplier basic information.",
      error: err,
    });
  }
};

// ============= Supplier Basic Information : =================
export const updateSupplierBasicInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  let transaction;
  try {
    const { supplier_id } = req.params;
    const user = (req as any).user;
    if (!user?.id || !user?.email || !user?.is_active) {
      errorResponse(res, {
        statusCode: 401,
        message: "Supplier authentication required",
      });
      return;
    }
    const payload = {
      ...req.body,
      organization_id: user?.organization_id,
      user_id: user?.id,
      supplier_id: supplier_id,
    };
    const { error } = updateSupplierInfoValidation.validate(payload);
    if (error) {
      errorResponse(res, {
        statusCode: 400,
        message: error.details[0].message,
      });
      return;
    }
    transaction = await AppDataSource.transaction();

    const result = await executeUpdateSupplierBasicInfo(
      user,
      payload,
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
    if (transaction) await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to add supplier basic information.",
      error: err,
    });
  }
};

// ============= Supplier Bank Details: =================
export const updateSupplierBankInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input = Array.isArray(req.body) ? req.body : [req.body];
  const { error: validationError } =
    updateSupplierBankInfoValidation.validate(input);

  if (validationError) {
    errorResponse(res, {
      message: validationError.message,
      statusCode: 400,
    });
    return;
  }

  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "Supplier authentication required",
      statusCode: 401,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateSupplierBankInfo(
      user,
      input,
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
      message: "Failed to update supplier bank information.",
      error: err,
    });
  }
};

// Controller function for updating KYC info
export const updateSupplierKycInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { supplier_kyc_id } = req.params;
  const { error: validationError } = updateSupplierKycInfoValidation.validate(
    req.body
  );

  if (validationError) {
    errorResponse(res, {
      message: validationError.message,
      statusCode: 400,
    });
    return;
  }

  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "Supplier authentication required",
      statusCode: 401,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateSupplierKycInfo(
      user,
      req.body,
      supplier_kyc_id,
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
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update supplier KYC information.",
      error: err,
    });
  }
};

export const updateSupplierContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input = Array.isArray(req.body) ? req.body : [req.body];
  const { error: validationError } =
    updateSupplierContactValidation.validate(input);

  if (validationError) {
    errorResponse(res, {
      message: validationError.message,
      statusCode: 400,
    });
    return;
  }

  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "Supplier authentication required",
      statusCode: 401,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateSupplierContact(user, input, transaction);

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
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update supplier contact information.",
      error: err,
    });
  }
};

export const updateSupplierClientReference = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input = Array.isArray(req.body) ? req.body : [req.body];
  const { error: validationError } =
    updateSupplierClientReferenceValidation.validate(input);

  if (validationError) {
    errorResponse(res, {
      message: validationError.message,
      statusCode: 400,
    });
    return;
  }

  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active) {
    errorResponse(res, {
      message: "Supplier authentication required",
      statusCode: 401,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeUpdateSupplierClientReference(
      user,
      input,
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
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to update supplier client reference information.",
      error: err,
    });
  }
};

// ====== get Supplier Basic Info:
export const getSupplierBasicInfo = async (
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
    const result = await executeGetSupplierBasicInfo(user);
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
      message: "Failed to get Supplier Basic Info detail.",
      error: err,
    });
  }
};

// ====== get Supplier Bank Info:
export const getSupplierBankInfo = async (
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
    const result = await executeGetSupplierBankInfo(user);
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
      message: "Failed to get Supplier Bank detail.",
      error: err,
    });
  }
};

// ====== get Supplier KYC Info:
export const getSupplierKYCInfo = async (
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
    const result = await executeGetSupplierKycInfo(user);
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
      message: "Failed to get Supplier KYC detail.",
      error: err,
    });
  }
};

// ====== get Supplier Contact Info:
export const getSupplierContactInfo = async (
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
    const result = await executeGetSupplierContacts(user);
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
      message: "Failed to get Supplier Contact detail.",
      error: err,
    });
  }
};
// getSupplierContactInfoBysupplierId
export const getSupplierContactInfoBysupplierId = async (
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
  const { user_id } = req.params;
  try {
    const result = await executeGetSupplierContactsById(user_id);
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
      message: "Failed to get Supplier Contact detail.",
      error: err,
    });
  }
};

// ====== get Supplier Client Reference Info:
export const getSupplierClientReferenceInfo = async (
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
    const result = await executeGetSupplierClientReferences(user);
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
      message: "Failed to get Supplier Contact detail.",
      error: err,
    });
  }
};

export const getDocumentList = async (
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
    organization_id: req.params.organization_id,
    user_id: req.params.user_id,
    page: req.query.page ? parseInt(req.query.page as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    search: req.query.search ? (req.query.search as string) : undefined,
  };

  try {
    const result = await executeGetDocumentList(requestData);
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
      message: "Failed to get Document List",
      error: err,
    });
  }
};

export const verifyVendorSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const token = req.headers.authorization?.split(" ")[1];
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "Vendor authentication required",
      statusCode: 401,
    });
    return;
  }

  try {
    const savedRecords = req.body;
    const { organization_id, user_id } = req.params;
    if (!user_id || !organization_id) {
      errorResponse(res, {
        message: "Organization id or supplier id is missing",
        statusCode: 400,
      });
      return;
    }

    const documentDetails = await Promise.all(
      savedRecords.map((item: any) =>
        SupplierDocument.findOne({
          where: { id: item.document_id, user_id, organization_id },
        })
      )
    );

    const notFoundDocuments = documentDetails.filter((doc) => !doc);
    if (notFoundDocuments.length > 0) {
      errorResponse(res, {
        message: "One or more documents not found",
        statusCode: 404,
      });
      return;
    }

    await Promise.all(
      savedRecords.map((item: any) =>
        SupplierDocument.update(
          { is_verified: item.is_verified ?? false },
          { where: { id: item.document_id, user_id, organization_id } }
        )
      )
    );

    const allUserDocuments = await SupplierDocument.findAll({
      where: { user_id, organization_id },
    });

    const allDocumentsVerified =
      allUserDocuments.length > 0 &&
      allUserDocuments.every((doc: any) => doc.is_verified === true);
    let userDetail;
    if (allDocumentsVerified) {
      const result = await http.put(
        `/v1/auth/update-vendor-status`,
        {
          user_id,
          organization_id,
          is_supplier_capable: true,
        },
        {
          baseURL: service.ADMIN_SERVICE_URL,
          token,
        }
      );

      if (!result.success) {
        errorResponse(res, {
          message: result.error?.message || "Failed to update vendor status",
          statusCode: result.statusCode || 500,
          error: result.error,
        });
        return;
      }
      userDetail = result?.data?.data;
    } else {
      const result = await http.put(
        `/v1/auth/update-vendor-status`,
        {
          user_id,
          organization_id,
          is_supplier_capable: false,
        },
        {
          baseURL: service.ADMIN_SERVICE_URL,
          token,
        }
      );

      if (!result.success) {
        errorResponse(res, {
          message: result.error?.message || "Failed to update vendor status",
          statusCode: result.statusCode || 500,
          error: result.error,
        });
        return;
      }
      userDetail = result?.data?.data;
    }

    successResponse(res, {
      message: "Documents verification status updated successfully",
      statusCode: 200,
      data: {
        vendor: userDetail,
        documents: allUserDocuments,
      },
    });
  } catch (err) {
    console.error("Error in verifyVendorSupplier:", err);
    errorResponse(res, {
      message: "Server error during document verification",
      statusCode: 500,
    });
  }
};

// ===== get Industeries list
export const getIndusteryList = async (req: Request, res: Response) => {
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
    search: req.query.search ? (req.query.search as string) : undefined,
  };

  try {
    const result = await executeGetIndustryList(requestData);
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
      message: res.statusMessage || "Failed to fecth Supplier Industry List",
    });
  }
};
