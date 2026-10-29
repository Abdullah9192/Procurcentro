import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { editVendorEvaluation, getVendorEvaluations } from "../controllers/vendor/VendorEvaluationCntroller";

const router = Router();

router.get("/:organization_id", authMiddleware, getVendorEvaluations);
router.put("/:id", authMiddleware, editVendorEvaluation);

export default router;
