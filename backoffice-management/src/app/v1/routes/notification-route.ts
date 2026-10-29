import express from "express";
import { createNotificationController, deleteNotificationController, getAllNotificationsController, getNotificationByIdController, updateNotificationController } from "../controllers/notification/NotificationController";


const router = express.Router();

router.post("/create-notification", createNotificationController);
router.get("/allnotifications", getAllNotificationsController);
router.get("/:id", getNotificationByIdController);
router.put("/:id/update", updateNotificationController);
router.delete("/:id/delete", deleteNotificationController);

export default router;
