import { Response } from "express";
import { encrypt } from "./CryptoUtils";

interface SuccessResponseParams {
  message: string;
  data?: any;
  statusCode?: number;
  isEncrypted?: boolean;
  status_summary?: Record<string, number>;
  pagination?: any;
}

interface ErrorResponseParams {
  message: string;
  statusCode?: number;
  error?: any;
  isEncrypted?: boolean;
}

export const successResponse = (
  res: Response,
  params: SuccessResponseParams
) => {
  const { statusCode = 200, message, data, isEncrypted = false, status_summary, pagination } = params;

  const payload = {
    success: true,
    status_code: statusCode,
    message,
    ...(data && { data }),
    ...(pagination && { pagination }),
    ...(status_summary && { status_summary }), // ✅ add here
  };

  const responseData = isEncrypted ? { encrypted: encrypt(payload) } : payload;
  return res.status(statusCode).json(responseData);
};

export const errorResponse = (res: Response, params: ErrorResponseParams) => {
  const { statusCode = 500, message, error, isEncrypted = false } = params;

  const payload = {
    success: false,
    status_code: statusCode,
    message,
    ...(error && {
      error: error instanceof Error ? error.message : String(error),
    }),
  };
  console.log(error);
  const responseData = isEncrypted ? { encrypted: encrypt(payload) } : payload;
  return res.status(statusCode).json(responseData);
};
