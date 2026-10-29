import express from "express";
import auctionRoutes from "./auctionRoutes";
const router = express.Router();

router.use("", auctionRoutes);

export default router;
