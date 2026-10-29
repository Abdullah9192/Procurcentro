import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { addSupplierRating, getSupplierRatings } from "../controllers/credit/RatingController";
const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// POST /api/supplier-rating  -> Add rating
protectedRouter.post("/add", addSupplierRating);

// GET /api/supplier-rating/:supplierId  -> Get ratings + average
protectedRouter.get("/:supplierId", getSupplierRatings);


router.use(protectedRouter);

export default router;
