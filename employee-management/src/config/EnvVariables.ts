import dotenv from "dotenv";
import { ensureEnv } from './ValidateEnv';
dotenv.config();

const variables = {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || "development",
    db: {
        TYPE: 'postgres' as const,
        HOST: ensureEnv(process.env.DB_HOST, "DB_HOST"),
        PORT: parseInt(process.env.DB_PORT || '5432', 10),
        USERNAME: ensureEnv(process.env.DB_USER, "DB_USER"),
        PASSWORD: ensureEnv(process.env.DB_PASSWORD, "DB_PASSWORD"),
        DATABASE: ensureEnv(process.env.DB_NAME, "DB_NAME"),
    },
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

    smtp: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM,
    },

    service: {
        ADMIN_SERVICE_URL: process.env.ADMIN_SERVICE_URL || 'http://admin-service:5001',
        VENDOR_SERVICE_URL: process.env.VENDOR_SERVICE_URL || 'http://vendor-service:5002',
        EMPLOYEE_SERVICE_URL: process.env.EMPLOYEE_SERVICE_URL || 'http://employee-service:5003',
        NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5004',
        BUDGET_SERVICE_URL: process.env.BUDGET_SERVICE_URL || 'http://budget-service:5005',
        REQUISITION_SERVICE_URL: process.env.REQUISITION_SERVICE_URL || 'http://requisition-service:5006',
        QUOTATION_SERVICE_URL: process.env.QUOTATION_SERVICE_URL || 'http://quotation-service:5009',
        PURCHASE_ORDER_SERVICE_URL: process.env.PURCHASE_ORDER_SERVICE_URL || 'http://order-service:50010',
    },

    //googleAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/admin/v1/auth/auth/google/callback",


    ADMIN_FRONTEND_URL: process.env.ADMIN_FRONTEND_URL,
    VENDOR_FRONTEND_URL: process.env.VEN_FRONTEND_URL,
    EMPLOYEE_FRONTEND_URL: process.env.EMP_FRONTEND_URL,

    RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://admin:admin123@rabbitmq:5672',

    azure: {
        ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'procurecentro',
        CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'procurecentro',
        CONNNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    }
}
export const { PORT, NODE_ENV, db, JWT_SECRET, JWT_EXPIRES_IN, smtp, ADMIN_FRONTEND_URL, VENDOR_FRONTEND_URL, azure, RABBITMQ_URL, service , GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL,} = variables;

