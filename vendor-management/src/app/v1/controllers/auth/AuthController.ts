import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../../../utils/general/ResponseUtils";
import { addVendorValidation } from "../../validators/AuthValidation";
import {
  executeLogin,
  executeRegister,
} from "../../../respository/auth/AuthRepository";
import { service } from "../../../../config/EnvVariables";
import { http } from "../../../services/AxiosClient";

// ============= Vendor Register Api: =================
export const register = async (req: Request, res: Response): Promise<void> => {
  const { error } = await addVendorValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  try {
    const result = await executeRegister(req.body);
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
      message: "Failed to register user.",
      error: err,
    });
  }
};

// ============= Vendor Login: =================
export const login = async (req: Request, res: Response): Promise<void> => {

  const { error } = addVendorValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  try {
    const result = await executeLogin(req.body);
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
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to login user.",
      error: err,
    });
  }
};


export const getVendorDetail = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id || !token) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }
  console.log("Fetching vendor details...", req.query, token);
  const requestData = {
    organization_id: req.query.organization_id ? req.query.organization_id : undefined,
    user_id: req.query.user_id ? req.query.user_id : undefined,
  };

  successResponse(res, {
    statusCode: 200,
    message: "data retrieved successfully.",
    data: requestData,
  });
  // try {
  //   const result = await executeVendorDetail(token,requestData);
  //   if (!result.success) {
  //     errorResponse(res, {
  //       statusCode: result.statusCode,
  //       message: result.message,
  //     });
  //     return;
  //   }
  //   successResponse(res, {
  //     statusCode: result.statusCode,
  //     message: result.message,
  //     data: result.data,
  //   });
  // } catch (err) {
  //   errorResponse(res, {
  //     statusCode: 500,
  //     message: "Failed to get Inventory detail.",
  //     error: err,
  //   });
  // }
};

// export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
//   const token = req.headers.authorization?.split(" ")[1];
//   const user = (req as any).user;

//   if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id || !token) {
//     errorResponse(res, {
//       message: "User authentication required",
//       statusCode: 401,
//     });
//     return;
//   }

//   const { id } = req.params;

//   if (!id) {
//     errorResponse(res, {
//       message: "Supplier id is required",
//       statusCode: 400,
//     });
//     return;
//   }

//   try {
//     const result = await executeGetSupplierById(token, id);

//     if (!result.success) {
//       errorResponse(res, {
//         statusCode: result.statusCode,
//         message: result.message,
//       });
//       return;
//     }

//     successResponse(res, {
//       statusCode: result.statusCode,
//       message: result.message,
//       data: result.data,
//     });
//   } catch (err) {
//     errorResponse(res, {
//       statusCode: 500,
//       message: "Failed to get supplier detail.",
//       error: err,
//     });
//   }
// };

// google auth

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  // const transaction = await AppDataSource.transaction();
  try {
    const { user, token } = (req as Request & { user?: any }).user || {};
    if (!user || !token) {
      errorResponse(res, {
        statusCode: 400,
        message: "Google login failed. User or token missing.",
      });
    }
    // Construct frontend redirect URL
    const redirectUrl = `${process.env.FRONTEND_URL}/?token=${token}`;
    // Redirect user to frontend with token
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google login error:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to register user.",
      error: err,
    });
  }
};
