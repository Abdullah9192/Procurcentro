import { Request, Response } from 'express';
import { loginUser } from '../../../respository/auth/AuthRepository';
import { successResponse, errorResponse } from '../../../utils/general/ResponseUtils';
import BackofficeUser from '../../../models/backoffice-user.entity';
import * as crypto from 'crypto';
import { publishToQueue } from '../../../../rabbitmq/Producer';
import { backOfficeEvents } from '../../../../rabbitmq/Events';
import { RBT_BACKOFFICE_QUEUES } from '../../../../rabbitmq/Queues';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) return errorResponse(res, { statusCode: 400, message: 'Email is required' });

    const { user, token } = await loginUser({ email, password });
    return successResponse(res, { statusCode: 200, message: 'Login successful', data: { user, access_token: token } });
  } catch (err: any) {
    return errorResponse(res, { statusCode: err?.statusCode || 500, message: err?.message || 'Login failed' });
  }
};

// Invite User API
export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    if (!email || !role)
      return errorResponse(res, { statusCode: 400, message: "Email and role are required" });

    // Check if user already exists
    const existingUser = await BackofficeUser.findOne({ where: { email } });
    if (existingUser)
      return errorResponse(res, { statusCode: 409, message: "User already exists" });

    // ✅ Get the max existing user_id (as number)
    const lastUser = await BackofficeUser.findOne({
      attributes: ["user_id"],
      order: [["user_id", "DESC"]],
    });

    let nextId = "0001";
    if (lastUser?.user_id) {
      const nextNum = parseInt(lastUser.user_id, 10) + 1;
      nextId = nextNum.toString().padStart(4, "0");
    }

    // ✅ Create the user
    const user = await BackofficeUser.create({
      email,
      role,
      user_id: nextId,
      is_invited: true,
    });

    // Send to RabbitMQ queue
    await publishToQueue(RBT_BACKOFFICE_QUEUES.BACKOFFICE_INVITE_QUEUE, {
      event: backOfficeEvents.backoffice_invite_users,
      data: {
        email,
        user_id: nextId,
      },
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User invited successfully and email queued for sending",
      data: { user },
    });
  } catch (err: any) {
    // ✅ Handle unique constraint error in case of concurrent inserts
    if (err?.name === "SequelizeUniqueConstraintError") {
      return errorResponse(res, {
        statusCode: 409,
        message: "User ID already exists, please retry",
      });
    }

    return errorResponse(res, {
      statusCode: err?.statusCode || 500,
      message: err?.message || "Failed to invite user",
    });
  }
};


  // Forgot Password API
  export const forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email)
        return errorResponse(res, { statusCode: 400, message: 'Email is required' });

      const user = await BackofficeUser.findOne({ where: { email } });
      if (!user)
        return errorResponse(res, { statusCode: 404, message: 'User not found' });

      // Generate reset token and expiry (valid for 1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        reset_token: resetToken,
        reset_token_expires_at: resetTokenExpiresAt,
      });

      // Commented: email sending logic
      // await sendResetPasswordEmail(email, resetToken);

      return successResponse(res, {
        statusCode: 200,
        message: 'Password reset link generated',
        data: { reset_token: resetToken },
      });
    } catch (err: any) {
      return errorResponse(res, {
        statusCode: err?.statusCode || 500,
        message: err?.message || 'Failed to process forgot password request',
      });
    }
  };

  export const googleLogin = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    // const transaction = await AppDataSource.transaction();
    try {
      const { user, accessToken, refreshToken, profile, token } = req.user as any;
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

  export const microsoftLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, accessToken, refreshToken, profile, token } = req.user as any;

      // Construct frontend redirect URL with JWT
      const redirectUrl = `${process.env.FRONTEND_URL}/?token=${token}`;

      // Redirect user to frontend with token
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error("Microsoft login error:", err);
      errorResponse(res, {
        statusCode: 500,
        message: "Failed to register user.",
        error: err,
      });
    }
  };