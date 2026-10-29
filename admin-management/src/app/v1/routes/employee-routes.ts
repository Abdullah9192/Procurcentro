import { Router } from "express";
import { dashboardController } from "../controllers/employee/EmployeeController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();

router.get("/dashboard", authMiddleware , dashboardController);


export default router;