import { Router } from "express";
import { getDashboardController, procurementDashboardController, upsertDashboardController, ValidationController } from "../controllers/admindashboard/DashboardController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";


const router = Router();

router.get('/customized-data/:organization_id',authMiddleware ,  getDashboardController);
router.get("/:organization_id/:subsidiary_id", authMiddleware, procurementDashboardController);
router.post("/validate-item-service-bulk", ValidationController.validateBulk);

router.post('/customize', authMiddleware, upsertDashboardController);


export default router;