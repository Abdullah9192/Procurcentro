import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { buyCredits, getCreditTransactionHistory, getDebitTransactionsGraph, getSupplierDocuments, getVendorDashboardData, getWalletBalance, handlePaystackWebhook, verifyCACNumber, verifyMultipleSupplierDocuments, verifyNinNumber, verifySupplierDocument, verifyTinNumber } from "../controllers/credit/CreditController";
const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// Mono webhook (no auth middleware here, Mono calls directly)
router.post("/payments/webhook", handlePaystackWebhook);

// User initiates buying credits
protectedRouter.post("/buy",buyCredits);

protectedRouter.get("/documents/verify/:id/:number" , verifySupplierDocument);
protectedRouter.post("/multiple-documents/verify" , verifyMultipleSupplierDocuments);

protectedRouter.post("/verify/nin" , verifyNinNumber);
protectedRouter.post("/verify/tin", verifyTinNumber);
protectedRouter.post("/verify/cac/:search", verifyCACNumber);

protectedRouter.get("/debit-graph", getDebitTransactionsGraph);

// GET /api/supplier-documents?status=verified
protectedRouter.get("/supplier-documents", getSupplierDocuments);

// GET /api/supplier-transaction-history
protectedRouter.get("/supplier-transaction-history", getCreditTransactionHistory);

// GET /api/wallet
protectedRouter.get("/wallet-balance", getWalletBalance);

// GET Dashboard Data
protectedRouter.get("/vendor-dashboard", getVendorDashboardData);

router.use(protectedRouter);

export default router;
