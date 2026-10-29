import { Response } from "express";
import { encrypt } from "./CryptoUtils";

interface SuccessResponseParams {
  message: string;
  data?: any;
  statusCode?: number;
  isEncrypted?: boolean;
}

interface ErrorResponseParams {
  message: string;
  statusCode?: number;
  error?: any;
  isEncrypted?: boolean;
  received_request?: any;
}

export const successResponse = (
  res: Response,
  params: SuccessResponseParams & { pagination?: { page: number; limit: number; total: number; totalPages: number } }
) => {
  const { statusCode = 200, message, data, isEncrypted = false, pagination } = params;

  const payload: any = {
    success: true,
    status_code: statusCode,
    message,
  };

  if (data) payload.data = data;
  if (pagination) payload.pagination = pagination; // optional pagination

  const responseData = isEncrypted ? { encrypted: encrypt(payload) } : payload;
  return res.status(statusCode).json(responseData);
};

export const errorResponse = (res: Response, params: ErrorResponseParams) => {
  const { statusCode = 500, message, error, isEncrypted = false, received_request } = params;

  const payload = {
    success: false,
    status_code: statusCode,
    received_request,
    message,
    ...(error && {
      error: error instanceof Error ? error.message : String(error),
    }),
  };
  console.log(error);
  const responseData = isEncrypted ? { encrypted: encrypt(payload) } : payload;
  return res.status(statusCode).json(responseData);
};
