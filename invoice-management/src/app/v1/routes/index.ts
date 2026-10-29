import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { convertPurchaseOrderInInvoice, getInvoices } from "../controllers/InvoiceController";

const router = Router()
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

protectedRouter.get("/invoices", getInvoices);
protectedRouter.get("/convert-order-invoice/:purchase_order_id", convertPurchaseOrderInInvoice);
router.use(protectedRouter);
export default router;