import { Request, Response } from "express";
import AppDataSource from "../../../../config/DatabaseSource";
import {
  errorResponse,
  successResponse,
} from "../../../utils/general/ResponseUtils";
import {
  changePasswordValidation,
  loginValidation,
  registerValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
  setPasswordValidation,
  verifyEmailValidation,
} from "../../validators/AuthValidation";
import {
  executeChangePassword,
  executeEmailVerification,
  executeGetMe,
  executeGetUser,
  executeGetUserByEmail,
  executeLogin,
  executePasswordResetRequest,
  executeRegister,
  executeResendVerificationEmail,
  executeResetPassword,
  executeSetPassword,
  executeUpdateUserById,
} from "../../../respository/auth/AuthRepository";
import User from "../../../models/User";
import { Op, QueryTypes, Transaction } from "sequelize";
import Organization from "../../../models/Organization";
import { userService } from "../../../../grpc/services/AdminGrpcService";
import { generateToken } from "../../../utils/general/JwtUtils";
import OrgRole from "../../../models/OrgRole";

// ======= Admin Register  Api :
export const register = async (req: Request, res: Response): Promise<void> => {
  const { error } = registerValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeRegister(req.body, transaction);
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
    console.log(err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to register user.",
      error: err,
    });
  }
};

// ======= Admin Login  Api :
export const login = async (req: Request, res: Response): Promise<void> => {
  const { error } = loginValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeLogin(req.body, transaction);
    if (!result.success) {
      await transaction.commit();
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
    console.error("OAuth login error detail:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to login user.",
      error: err && typeof err === "object"
        ? (err as any).message ?? JSON.stringify(err)
        : String(err),
    });
  }
};

export const setPassword = async (req: Request, res: Response): Promise<void> => {
  const { error, value } = setPasswordValidation.validate(req.body);

  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return
  }

  const transaction = await AppDataSource.transaction();

  try {
    const result = await executeSetPassword(value, transaction);

    if (!result.success) {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return
    }

    await transaction.commit();

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
    return

  } catch (err) {
    await transaction.rollback();
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to set password.",
      error: err,
    });
    return
  }
};

export const createGoogleUser = async (req: Request, res: Response): Promise<void> => {
  const transaction = await AppDataSource.transaction();

  try {
    const { sub, name, email, accessToken, refreshToken, email_verified, type } = req.body;

    // Check if user exists
    let user: any = await User.findOne({ where: { email }, transaction });

    if (user) {
      // Update Google data for existing user
      if (type === "google") {
        await User.update(
          {
            google_id: sub,
            googleaccesstoken: accessToken,
            googlerefreshtoken: refreshToken,
            is_email_verified: email_verified ?? true,
          },
          { where: { email }, transaction }
        );
      } else if (type === "microsoft") {
        await User.update(
          {
            microsoft_id: sub,
            microsoftaccesstoken: accessToken,
            microsoftrefreshtoken: refreshToken,
            is_email_verified: email_verified ?? true,
          },
          { where: { email }, transaction }
        );
      } else {
        await transaction.rollback();
        errorResponse(res, {
          statusCode: 400,
          message: "Invalid type. Must be 'google' or 'microsoft'.",
        });
      }

      user = await User.findOne({ where: { id: user.id }, transaction });
    } else {
      await transaction.rollback();
      errorResponse(res, {
        statusCode: 400,
        message: "You havn't added by any organization till yet.",
      });
    }

    // Log incoming OAuth payload for debugging
    console.log("OAuth Request Payload:", {
      sub,
      name,
      email,
      type,
      accessToken: "[REDACTED]",
      refreshToken: "[REDACTED]",
      email_verified,
    });


    // Generate token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      organization_id: user.organization_id,
      org_role_id: user.org_role_id,
      user_role: user.org_role?.role_name,
      user_type: user.user_type,
    });

    await transaction.commit();

    const userPlain = user.get({ plain: true });
    delete userPlain.password;

    const loginProvider =
      type === "google"
        ? "Google"
        : type === "microsoft"
          ? "Microsoft"
          : "OAuth";

    successResponse(res, {
      statusCode: 200,
      message: `${loginProvider} login successful.`,
      data: {
        token,
        user: userPlain,
        received_request: req.body
      }
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Error in Google login:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to login with Google.",
      error: err,
      received_request: req.body
    });
  }
};

// ======= Admin Reset Password Request :
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { error } = requestPasswordResetValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executePasswordResetRequest(req.body, transaction);
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
      message: "Failed to process password reset request.",
      error: err,
    });
  }
};

// ======= Reset Password Api :
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const bodyWithToken = { ...req.body, token: req.params.token };

  const { error } = resetPasswordValidation.validate(bodyWithToken);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeResetPassword(
      {
        token: req.params.token,
        new_password: req.body.new_password,
      },
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
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to reset password.",
      error: err,
    });
  }
};

// ======= Verify Email :
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;

  if (!token) {
    errorResponse(res, {
      statusCode: 400,
      message: "Verification token is required",
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeEmailVerification(token, transaction);

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
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to verify email.",
      error: err,
    });
  }
};

// ======= Verify Rsend Verification Email :
export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { error } = await verifyEmailValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeResendVerificationEmail(req.body, transaction);

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
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to resend verification email.",
      error: err,
    });
  }
};

// ======= Admin Logout :
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token");
    successResponse(res, {
      statusCode: 200,
      message: "Logged out successfully",
    });
  } catch (err) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to logout user.",
      error: err,
    });
  }
};

// ======= get me :
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  if (!userId) {
    errorResponse(res, {
      statusCode: 401,
      message: "Unauthorized: User ID not found in token",
    });
    return;
  }

  try {
    const result = await executeGetMe({ userId });
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
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to fetch user.",
      error: err?.message || "Internal error",
    });
  }
};

// ======= get user :
export const getUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req?.params?.user_id;
  console.log("get user ID ", userId);
  try {
    const result = await executeGetUser({ userId });
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
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to fetch user.",
      error: err?.message || "Internal error",
    });
  }
};

export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  const email = req?.params?.email; // or req.query.email if query param se lena hai
  console.log("get user by email ", email);

  try {
    const result = await executeGetUserByEmail({ email });

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
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to fetch user.",
      error: err?.message || "Internal error",
    });
  }
};

export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  const { google_id, is_active } = req.body;

  console.log("update user by id ", userId, " google_id:", google_id);

  try {
    const result = await executeUpdateUserById({ id: userId, google_id, is_active });

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
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to update user.",
      error: err?.message || "Internal error",
    });
  }
};


// ======= change password :
export const changePassword = async (
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
  const { error } = changePasswordValidation.validate(req.body);
  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }
  const transaction = await AppDataSource.transaction();
  try {
    const result = await executeChangePassword(user, req.body, transaction);
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
    console.log(err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to change password.",
      error: err,
    });
  }
};

export const getUserListing = async (
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
    const { organization_id, email, user_type, is_active } = req.query;

    const whereClause: any = {
      organization_id: organization_id || user.organization_id,
    };

    if (email) {
      whereClause.email = { [Op.iLike]: `%${email}%` }; // case-insensitive search
    }

    if (user_type) {
      whereClause.user_type = user_type;
    }

    if (is_active !== undefined) {
      whereClause.is_active = is_active === "true"; // string → boolean
    }

    if (req.query.is_owner !== undefined) {
      whereClause.is_owner = req.query.is_owner === "true"; // string → boolean
    }


    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: Organization,
          as: "organization", // must match your association alias in User model
          attributes: ["id", "name", "address"], // pick needed fields
          required: false,
        },
      ],
    });
    successResponse(res, {
      statusCode: 200,
      message: "User list fetched successfully",
      data: users,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to fetch user.",
      error: err?.message || "Internal error",
    });
  }
};

// Google auth
export const googleLogin = async (
  req: Request,
  res: Response
) => {
  // const transaction = await AppDataSource.transaction();
  try {
    const { token } = req.user as any;

    const userType = req.query.state as string;
    // Construct frontend redirect URL
    let redirectUrl = process.env.FRONTEND_URL;

    if (userType === "admin") {
      redirectUrl = `${process.env.ADMIN_FRONTEND_URL}/admin/dashboard`;
    } else if (userType === "vendor") {
      redirectUrl = `${process.env.VENDOR_FRONTEND_URL}/vendor/dashboard`;
    } else if (userType === "employee") {
      redirectUrl = process.env.EMPLOYEE_FRONTEND_URL;
    }
    // Redirect user to frontend with token
    const finalRedirectUrl = `${redirectUrl}?token=${token}`;

    console.log("FINAL REDIRECT URL:", finalRedirectUrl);

    return res.redirect(finalRedirectUrl);
  } catch (err) {
    console.error("Google login error:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to register user.",
      error: err,
    });
  }
};

export const microsoftLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, userType } = req.user as any;

    let redirectUrl = process.env.FRONTEND_URL || "";

    if (userType === "admin") {
      redirectUrl = process.env.ADMIN_FRONTEND_URL || redirectUrl;
    } else if (userType === "vendor") {
      redirectUrl = process.env.VENDOR_FRONTEND_URL || redirectUrl;
    } else if (userType === "employee") {
      redirectUrl = process.env.EMPLOYEE_FRONTEND_URL || redirectUrl;
    }

    const finalRedirectUrl = `${redirectUrl}?token=${token}`;

    console.log("FINAL MICROSOFT REDIRECT URL:", finalRedirectUrl);

    return res.redirect(finalRedirectUrl);

  } catch (err) {
    console.error("Microsoft login error:", err);
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to login user.",
      error: err,
    });
  }
};


