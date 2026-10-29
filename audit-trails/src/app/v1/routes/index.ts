import express from "express";
import auditLogsRoutes from "./auditTrailsRoutes";
const router = express.Router();

router.use("", auditLogsRoutes);

export default router;
