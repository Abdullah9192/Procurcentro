import { Router } from "express";
import { getAllSubscriptions, getUserTransactionsController } from "../controllers/subscription/SubscriptionController";

const router = Router();

router.get("/user/:user_id", getUserTransactionsController);
router.get("/plan", getAllSubscriptions);


export default router;