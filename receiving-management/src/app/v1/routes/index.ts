import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router()
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// protectedRouter.get("/get-receiving-detail/:order_id", getReceivingDetail);
router.use(protectedRouter);
export default router;