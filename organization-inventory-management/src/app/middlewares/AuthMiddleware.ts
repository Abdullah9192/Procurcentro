import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/general/ResponseUtils";

interface TokenPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  is_active: boolean;
  organization_id: string;
  user_role: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Try to get token from cookies first, then from Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    errorResponse(res, {
      statusCode: 401,
      message: "Unauthorized: No token provided",
      error: "Token missing from cookies and Authorization header",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    errorResponse(res, {
      statusCode: 401,
      message: "Unauthorized: Invalid token",
      error: err,
    });
    return;
  }
};
