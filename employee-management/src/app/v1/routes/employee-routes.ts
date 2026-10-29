import { Router } from "express";
import {getDashboardData } from "../controllers/auth/AuthController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();

router.get("/dashboard-data", authMiddleware,getDashboardData);

export default router;
