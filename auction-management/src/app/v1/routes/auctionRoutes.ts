import express from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  getAuctionsForEmpoyee,
  createUpdateBid,
  getAuctionBids,
  getMyAuctions,
} from "../controllers/auctionController";

const router = express.Router();

router.get("/employee", authMiddleware, getAuctionsForEmpoyee);
router.get("/bids/:auction_id", authMiddleware, getAuctionBids);
router.get("/allbids/", authMiddleware, getMyAuctions);
router.get("", authMiddleware, getAuctions);
router.get("/:id", authMiddleware, getAuctionById);
router.put("/bid", authMiddleware, createUpdateBid);
router.put("/:id", authMiddleware, updateAuction);
router.post("", authMiddleware, createAuction);

export default router;
