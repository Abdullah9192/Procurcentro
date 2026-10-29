import express from "express";
import reportRoutes from "./reportRoutes";
const router = express.Router();

router.use("", reportRoutes);

export default router;
