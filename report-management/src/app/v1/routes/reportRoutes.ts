import express from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import {
  createReport,
  getReportById,
  getReports,
  updateReport,
} from "../controllers/reportController";

const router = express.Router();

router.get("", authMiddleware, getReports);
router.get("/:id", authMiddleware, getReportById);
router.put("/:id", authMiddleware, updateReport);
router.post("", authMiddleware, createReport);

export default router;
