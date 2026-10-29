import dotenv from "dotenv";
import { ensureEnv } from "./ValidateEnv";

dotenv.config();
// Use local variable to avoid redeclaration
const _NODE_ENV = process.env.NODE_ENV || "development";
// Conditionally assign frontend URLs
const _ADMIN_FRONTEND_URL =
  _NODE_ENV === "production"
    ? process.env.ADMIN_PROD_FRONTEND_URL
    : process.env.ADMIN_FRONTEND_URL;

const _VENDOR_FRONTEND_URL =
  _NODE_ENV === "production"
    ? process.env.VENDOR_PROD_FRONTEND_URL
    : process.env.VENDOR_FRONTEND_URL;

const _EMPLOYEE_FRONTEND_URL =
  _NODE_ENV === "production"
    ? process.env.EMPLOYEE_PROD_FRONTEND_URL
    : process.env.EMPLOYEE_FRONTEND_URL;
const _BACKOFFICE_FRONTEND_URL =
  _NODE_ENV === "production"
    ? process.env.BACKOFFICE_PROD_FRONTEND_URL
    : process.env.BACKOFFICE_FRONTEND_URL;

const variables = {
  PORT: process.env.PORT || 5004,
  NODE_ENV: _NODE_ENV,
  db: {
    TYPE: "postgres" as const,
    HOST: ensureEnv(process.env.DB_HOST, "DB_HOST"),
    PORT: parseInt(process.env.DB_PORT || "5432", 10),
    USERNAME: ensureEnv(process.env.DB_USER, "DB_USER"),
    PASSWORD: ensureEnv(process.env.DB_PASSWORD, "DB_PASSWORD"),
    DATABASE: ensureEnv(process.env.DB_NAME, "DB_NAME"),
  },

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  smtp: {
    // SMTP_HOST: process.env.SMTP_HOST,
    // SMTP_PORT: process.env.SMTP_PORT,
    // SMTP_USER: process.env.SMTP_USER,
    // SMTP_PASS: process.env.SMTP_PASS,
    // SMTP_FROM: process.env.SMTP_FROM,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM: process.env.SENDGRID_FROM,
  },

  ADMIN_FRONTEND_URL: _ADMIN_FRONTEND_URL,
  VENDOR_FRONTEND_URL: _VENDOR_FRONTEND_URL,
  EMPLOYEE_FRONTEND_URL: _EMPLOYEE_FRONTEND_URL,
  BACKOFFICE_FRONTEND_URL: _BACKOFFICE_FRONTEND_URL,

  RABBITMQ_URL:
    process.env.RABBITMQ_URL ?? "amqp://admin:admin123@rabbitmq:5672",

  azure: {
    ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME || "procurecentro",
    CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || "procurecentro",
    CONNNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
  },

  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
  AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
  AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
  AZURE_REDIRECT_URI: process.env.AZURE_REDIRECT_URI,

  //googleAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:8000/api/admin/v1/auth/auth/google/callback",

  //microsoft auth
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_CALLBACK_URL:
    process.env.MICROSOFT_CALLBACK_URL ||
    "http://localhost:8000/api/admin/v1/auth/auth/microsoft/callback",

  service: {
    ADMIN_SERVICE_URL:
      process.env.ADMIN_SERVICE_URL || "http://admin-service:5001",
    VENDOR_SERVICE_URL:
      process.env.VENDOR_SERVICE_URL || "http://vendor-service:5002",
    EMPLOYEE_SERVICE_URL:
      process.env.EMPLOYEE_SERVICE_URL || "http://employee-service:5003",
    NOTIFICATION_SERVICE_URL:
      process.env.NOTIFICATION_SERVICE_URL ||
      "http://notification-service:5004",
    BUDGET_SERVICE_URL:
      process.env.BUDGET_SERVICE_URL || "http://budget-service:5005",
    ORDER_SERVICE_URL:
      process.env.ORDER_SERVICE_URL || "http://order-service:50010",
    QUOTATION_SERVICE_URL:
      process.env.QUOTATION_SERVICE_URL || "http://quotation-service:5009",
  },
};

export const {
  PORT,
  NODE_ENV,
  db,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  smtp,
  ADMIN_FRONTEND_URL,
  VENDOR_FRONTEND_URL,
  EMPLOYEE_FRONTEND_URL,
  BACKOFFICE_FRONTEND_URL,
  azure,
  RABBITMQ_URL,
  AZURE_CLIENT_ID,
  AZURE_TENANT_ID,
  AZURE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  MICROSOFT_CALLBACK_URL,
  AZURE_REDIRECT_URI,
  service,
} = variables;
