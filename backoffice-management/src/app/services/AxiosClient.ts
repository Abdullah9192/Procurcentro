import axios, { AxiosRequestConfig, AxiosError } from "axios";

// Default fallback baseURL
const DEFAULT_BASE_URL = process.env.BACKOFFICE_SERVICE_URL || "http://backoffice-service:50015";

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: any;
}

interface RequestOptions extends AxiosRequestConfig {
  token?: string;
  baseURL?: string;
}

const handleRequest = async <T = any>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { token, baseURL = DEFAULT_BASE_URL, ...axiosConfig } = options;

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  try {
    const response = await instance.request<T>({
      method,
      url,
      data: method === "get" ? undefined : data,
      params: method === "get" ? data : undefined,
      ...axiosConfig,
    });

    return {
      success: true,
      statusCode: response.status,
      message: "Request successful",
      data: response.data,
    };
  } catch (error: any) {
    const err = error as AxiosError;
    return {
      success: false,
      statusCode: err.response?.status || 500,
      message: err.response?.statusText || "Internal Server Error",
      error: err.response?.data || err.message,
    };
  }
};

export const http = {
  get: <T = any>(url: string, params?: any, options?: RequestOptions) =>
    handleRequest<T>("get", url, params, options),

  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    handleRequest<T>("post", url, body, options),

  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    handleRequest<T>("put", url, body, options),

  delete: <T = any>(url: string, params?: any, options?: RequestOptions) =>
    handleRequest<T>("delete", url, params, options),
};
