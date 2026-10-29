import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../../utils/general/ResponseUtils";
import { addEmployeeValidation } from "../../validators/AuthValidation";
import AppDataSource from "../../../../config/DatabaseSource";
import { executeLogin, executeRegister } from "../../../respository/auth/AuthRepository";
import { executeDashboardData } from "../../../respository/auth/EmployeeRepository";
import { RequestHandler } from "express";

// ============= Employee Register Api: =================
export const register = async (req: Request, res: Response): Promise<void> => {
  const { error } = addEmployeeValidation.validate(req.body);
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

// ======= Employee Login  Api : =====================
export const login = async (req: Request, res: Response): Promise<void> => {
  const { error } = addEmployeeValidation.validate(req.body);
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
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to login user.",
      error: err,
    });
  }
};


// ========== Get Employee List Api: ================
// export const getEmployeeList = async (req: Request, res: Response): Promise<void> => {
//   const user = (req as any).user;

//   if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
//     errorResponse(res, {
//       message: "User authentication required",
//       statusCode: 401,
//     });
//     return;
//   }
//   try {
//     const result = await executeGetEmployeeList(req.params.organization_id);
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
//       message: "Failed to get employee list.",
//       error: err,
//     });
//   }
// }

export const getDashboardData: RequestHandler = async (req, res) => {
  const user = (req as any).user;
  if (!user?.id || !user?.email || !user?.is_active || !user?.organization_id) {
    errorResponse(res, {
      message: "User authentication required",
      statusCode: 401,
    });
    return;
  }


    const token = req.headers.authorization?.split(" ")[1] || "";
  try {
    const result = await executeDashboardData(token);
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

// google auth
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  // const transaction = await AppDataSource.transaction();
  try {
    const { user, token } = (req as Request & { user?: any }).user || {};
    console.log(user , token);
    if (!user || !token) {
      errorResponse(res, {
        statusCode: 400,
        message: "Google login failed. User or token missing.",
      });
    }
    console.log(token);
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
