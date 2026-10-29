import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { approvalRequisition } from "../controllers/ApprovalRequisitionController";
import { approvalBudget } from "../controllers/ApprovalBudgetController";
import { approvalQuotation } from "../controllers/ApprovalQuotationController";
import { approvalPurchaseOrder } from "../controllers/ApprovalPuchaseOrderController";
import { approvalInventory } from "../controllers/ApprovalInventoryController";
import { approvalApproval, verifyVendorDocument } from "../controllers/ApprovalVendorController";
const router = Router()
const protectedRouter = Router();
protectedRouter.use(authMiddleware);


protectedRouter.post("/approval-requisition/:requisition_id", approvalRequisition);

protectedRouter.post("/approval-budget/:budget_id", approvalBudget);

protectedRouter.post("/approval-quotation/:quotation_id", approvalQuotation);

protectedRouter.post("/approval-purchase-order/:purchase_order_id", approvalPurchaseOrder);

protectedRouter.post("/approval-inventory/:inventory_id", approvalInventory);

protectedRouter.put("/approval-vendor/:organization_id/:user_id", approvalApproval);

protectedRouter.put("/verify-vendor_documents/:organization_id/:user_id", verifyVendorDocument);

router.use(protectedRouter);
export default router;