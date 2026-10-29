import dotenv from "dotenv";
import { ensureEnv } from './ValidateEnv';
dotenv.config();

const variables = {
    PORT: process.env.PORT || 5002,
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

    //googleAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/admin/v1/auth/auth/google/callback",

    //microsoft auth
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_CALLBACK_URL: process.env.MICROSOFT_CALLBACK_URL || "http://localhost:8000/api/admin/v1/auth/auth/microsoft/callback",

    ADMIN_FRONTEND_URL: process.env.ADMIN_FRONTEND_URL,
    VENDOR_FRONTEND_URL: process.env.VEN_FRONTEND_URL,
    EMPLOYEE_FRONTEND_URL: process.env.EMP_FRONTEND_URL,

    RABBITMQ_URL: process.env.RABBITMQ_URL ?? 'amqp://admin:admin123@rabbitmq:5672',

    azure: {
        ACCOUNT_NAME: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'procurecentro',
        CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'procurecentro',
        CONNNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || ''
    },

    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
    AZURE_REDIRECT_URI: process.env.AZURE_REDIRECT_URI,

    service: {
        ADMIN_SERVICE_URL: process.env.ADMIN_SERVICE_URL || 'http://admin-service:5001',
        VENDOR_SERVICE_URL: process.env.VENDOR_SERVICE_URL || 'http://vendor-service:5002',
        EMPLOYEE_SERVICE_URL: process.env.EMPLOYEE_SERVICE_URL || 'http://employee-service:5003',
        BUDGET_SERVICE_URL: process.env.BUDGET_SERVICE_URL || 'http://budget-service:5005',
        NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5004/api/notification',
    },

    grpcUrl: {
        ADMIN_GRPC_URL: process.env.ADMIN_GRPC_URL || 'admin-service:50051',
        VENDOR_GRPC_URL: process.env.VENDOR_GRPC_URL || 'vendor-service:50052',
        EMPLOYEE_GRPC_URL: process.env.EMPLOYEE_GRPC_URL || 'employee-service:50053',
        NOTIFICATION_GRPC_URL: process.env.NOTIFICATION_GRPC_URL || 'notification-service:50054',
        BUDGET_GRPC_URL: process.env.BUDGET_GRPC_URL || 'budget-service:50055',
    },
    MONO_PUBLIC_KEY: process.env.MONO_PUBLIC_KEY || 'live_pk_wxo8eimzi5p0rrz3sl0b',
    MONO_SECRET_KEY: process.env.MONO_SECRET_KEY || 'live_sk_jz0hkrxv2zycm82a9l5m',
    MONO_DOCS_BASE_URL: process.env.MONO_DOCS_BASE_URL || 'https://api.withmono.com/v3',
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'sk_test_df61b641562b9c45c5593a04fb2ba9a502c351e6',
}
export const { PORT, AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET, AZURE_REDIRECT_URI, NODE_ENV, db, JWT_SECRET, JWT_EXPIRES_IN, smtp, ADMIN_FRONTEND_URL, VENDOR_FRONTEND_URL, azure, RABBITMQ_URL, service, grpcUrl, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_CALLBACK_URL, MONO_PUBLIC_KEY, MONO_SECRET_KEY, MONO_DOCS_BASE_URL, PAYSTACK_SECRET_KEY } = variables;

