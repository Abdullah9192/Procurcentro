import express from "express";
import { createNotification, getNotificationsByReceiver, markAsRead, sendPurchaseOrderContractEmail } from "../controllers/notification/NotificationController";

const router = express.Router();

router.post("/create", createNotification);
router.get("/get/:receiver_id", getNotificationsByReceiver);
router.patch("/:id/read", markAsRead);
router.post("/purchase-order-contract/email",sendPurchaseOrderContractEmail);

export default router;
