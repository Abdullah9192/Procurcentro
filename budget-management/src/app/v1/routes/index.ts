import { Router } from "express";
import { multipartParser } from "../../middlewares/MultiParserMiddleware";
import {
  addBudget,
  getBudgetDetail,
  getBudgetList,
  bulkUploadBudget,
  deleteBudgetFile,
  statusBudget,
  getBudgetData,
  getBudgetSummary
} from "../controllers/admin/BudgetController";
import { setUploadFolder } from "../../middlewares/SetUploadFolder";
import multer from "multer";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();
const upload = multer({ dest: "uploads/" });

const protectedRouter = Router();
protectedRouter.use(authMiddleware);

protectedRouter.post(
  "/add-budget",
  setUploadFolder("budgets"),
  multipartParser,
  addBudget
);
protectedRouter.get("/budget-list", getBudgetList);
protectedRouter.get("/budget-detail/:budget_id", getBudgetDetail);
protectedRouter.post("/bulk-upload-budget", upload.single("file"), bulkUploadBudget);
protectedRouter.put("/status-budget/:budget_id", statusBudget);
protectedRouter.delete("/budget-file", deleteBudgetFile);
protectedRouter.get("/budget-data/:org_category_id/:subsidiary_id/:subsidiary_branch_id/:branch_department_id", getBudgetData);
protectedRouter.get('/get-budget-summary', getBudgetSummary)

// Attach the sub-router
router.use(protectedRouter);
export default router;
