import express from "express";
import {
  createCreditController,
  getAllCreditsController,
  getCreditByIdController,
  updateCreditController,
  deleteCreditController,
} from "../controllers/credit-value/CreditController";

const router = express.Router();

router.post("/create-credits", createCreditController);
router.get("/allcredits", getAllCreditsController);
router.get("/:id", getCreditByIdController);
router.put("/:id/update", updateCreditController);
router.delete("/:id/delete", deleteCreditController);

export default router;
