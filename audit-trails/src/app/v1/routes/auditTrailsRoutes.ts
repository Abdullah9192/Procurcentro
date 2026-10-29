import express from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import {
  createAuditLog,
  getAuditLogById,
  getAuditLogs,
} from "../controllers/auditTrailsController";

const router = express.Router();

router.get("", authMiddleware, getAuditLogs);
router.get("/:id", authMiddleware, getAuditLogById);
router.post("", authMiddleware, createAuditLog);

export default router;
