import { Router } from "express";
import { dashboardStatsController, getOrganizationEmployeeUsers, getOrganizationSuppliers, procurementActivity, userDetailsController, userManagementController } from "../controllers/backoffice/BackOfficeController";

const router = Router();

router.get("/usermanagement/report", userManagementController);
router.get("/dashboard-data", dashboardStatsController);
router.get("/usermanagement/basic-info/:id", userDetailsController);
router.get("/:organization_id/employee-users", getOrganizationEmployeeUsers);
router.get("/:organization_id/procurement-activity", procurementActivity);
router.get("/:organization_id/suppliers-listing", getOrganizationSuppliers);


export default router;