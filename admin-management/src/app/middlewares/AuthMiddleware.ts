import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/general/ResponseUtils";
import User from "../models/User"; // 👈 make sure path is correct

interface TokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  is_active: boolean;
  organization_id: string;
  user_role: string;
  user_type: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    errorResponse(res, {
      statusCode: 401,
      message: "Unauthorized: No token provided",
      error: "Token missing from Authorization header",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenPayload;

    const user = await User.findOne({
      where: {
        id: decoded.id,
        email: decoded.email,
      },
    });

    if (!user) {
      errorResponse(res, {
        statusCode: 401,
        message: "Unauthorized: User not found",
      });
      return;
    }

    if (!user.is_active) {
      errorResponse(res, {
        statusCode: 403,
        message: "Forbidden: User is not active",
      });
      return;
    }

    (req as any).user = decoded; // 👈 attach full user record
    next();
  } catch (err) {
    console.log("JWT VERIFY ERROR:", err);
    errorResponse(res, {
      statusCode: 401,
      message: "Unauthorized: Invalid or expired token",
      error: err,
    });
    return;
  }
};
