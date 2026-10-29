import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { multipartParser } from "../../middlewares/MultiParserMiddleware";
import {
  addBranch,
  addDepartment,
  addSubsidiary,
  branchBulkUpload,
  deactivateBranch,
  deactivateDepartment,
  deactivateSubsidiary,
  deleteBranch,
  deleteDepartment,
  deleteSubsidiary,
  departmentBulkUpload,
  getBranch,
  getBranches,
  getDepartment,
  getDepartments,
  getOrganization,
  getSubsidiaries,
  getSubsidiary,
  subsidiaryBulkUpload,
  updateBranch,
  updateDepartment,
  updateOrganization,
  updateSubsidiary,
} from "../controllers/setup/ProfileManagementController";
import {
  addCategory,
  addCategoryService,
  addCurrency,
  addSubCategory,
  categoryBulkUpload,
  categoryServiceBulkUpload,
  currencyBulkUpload,
  deactivateCategory,
  deactivateCategoryService,
  getCategoriesByIds,
  deactivateCurrency,
  deactivateSubCategory,
  deleteCategory,
  deleteCategoryService,
  deleteCurrency,
  deleteSubCategory,
  getCategories,
  getCategory,
  getCategoryService,
  getCategoryServices,
  getCurrencies,
  getCurrency,
  getSubCategories,
  getSubCategory,
  subCategoryItemBulkUpload,
  updateCategory,
  updateCategoryService,
  updateCurrency,
  updateSubCategory,
} from "../controllers/setup/SystemConfigurationController";
import {
  addCreateWorkflowSteps,
  addWorkflow,
  getApprovalWorkflowById,
  getApprovalWorkflowByIds,
  getUsersForApprovalWorkflow,
  getWorkflowList,
} from "../controllers/setup/ApprovalWorkflowController";
import {
  getModules,
  upsertOrganizationSettings,
} from "../controllers/setup/OrganizationSettingController";
import { setUploadFolder } from "../../middlewares/SetUploadFolder";
import multer from "multer";
import {
  addRole,
  deactivateRole,
  deactivateUser,
  deleteRole,
  getAdminUsersList,
  getOrganizationEmployeeList,
  getPermissionModules,
  getRole,
  getRoles,
  inviteAdmin,
  inviteUsers,
  inviteUsersBulkUpload,
  transferOwnerShip,
  updateRole,
  getUsersByIds,
  updateUser,
  acceptInvite,
} from "../controllers/setup/InviteUserController";
import {
  getSupplierById,
  getSupplierFilterOptions,
  getSuppliers,
  inviteSuppliers,
  updateSupplierStatus,
} from "../controllers/setup/InviteSupplierController";
import { getBranchesAndDepartments } from "../controllers/setup/HelperController";

const router = Router();
const upload = multer({ dest: "uploads/" });

// ✅ Sub-router for authenticated routes
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// Organization Profile Setup
protectedRouter.get("/organization", getOrganization);
protectedRouter.put(
  "/update-profile",
  setUploadFolder("organization-logo"),
  multipartParser,
  updateOrganization
);

// Subsidiary
protectedRouter.post("/subsidiary", addSubsidiary);
protectedRouter.get("/subsidiaries", getSubsidiaries);
protectedRouter.get("/subsidiary/:subsidiary_id", getSubsidiary);
protectedRouter.put("/update-subsidiary/:id", updateSubsidiary);
protectedRouter.delete("/delete-subsidiary/:id", deleteSubsidiary);
protectedRouter.put("/deactivate-subsidiary/:id", deactivateSubsidiary);
protectedRouter.post(
  "/subsidiary-bulkupload",
  upload.single("file"),
  subsidiaryBulkUpload
);

// Branch
protectedRouter.post("/branch", addBranch);
protectedRouter.get("/branches", getBranches);
protectedRouter.get("/branch/:id", getBranch);
protectedRouter.put("/update-branch/:id", updateBranch);
protectedRouter.delete("/delete-branch/:id", deleteBranch);
protectedRouter.put("/deactivate-branch/:id", deactivateBranch);
protectedRouter.post(
  "/branch-bulkupload",
  upload.single("file"),
  branchBulkUpload
);

//helper api
protectedRouter.get("/getbranch/department", getBranchesAndDepartments);
//helper api

// Department
protectedRouter.post("/department", addDepartment);
protectedRouter.get("/departments", getDepartments);
protectedRouter.get("/department/:id", getDepartment);
protectedRouter.put("/update-department/:id", updateDepartment);
protectedRouter.delete("/delete-department/:id", deleteDepartment);
protectedRouter.put("/deactivate-department/:id", deactivateDepartment);
protectedRouter.post(
  "/department-bulkupload",
  upload.single("file"),
  departmentBulkUpload
);

// Category
protectedRouter.post("/category", addCategory);
protectedRouter.get("/categories", getCategories);
protectedRouter.get("/category/:id", getCategory);
protectedRouter.put("/update-category/:id", updateCategory);
protectedRouter.delete("/delete-category/:id", deleteCategory);
protectedRouter.put("/deactivate-category/:id", deactivateCategory);
protectedRouter.post(
  "/category-bulkupload",
  upload.single("file"),
  categoryBulkUpload
);
protectedRouter.post("/get-categories-ids", getCategoriesByIds);

// Sub Category
protectedRouter.post("/sub-category", addSubCategory);
protectedRouter.get("/sub-categories", getSubCategories);
protectedRouter.get("/sub-category/:id", getSubCategory);
protectedRouter.put("/update-sub-category/:id", updateSubCategory);
protectedRouter.delete("/delete-sub-category/:id", deleteSubCategory);
protectedRouter.put("/deactivate-sub-category/:id", deactivateSubCategory);
protectedRouter.post(
  "/sub-category-bulkupload",
  upload.single("file"),
  subCategoryItemBulkUpload
);

// Service Category
protectedRouter.post("/category-service", addCategoryService);
protectedRouter.get("/category-Services", getCategoryServices);
protectedRouter.delete("/delete-category-service/:id", deleteCategoryService);
protectedRouter.post(
  "/category-service-bulkupload",
  upload.single("file"),
  categoryServiceBulkUpload
);
protectedRouter.get("/category-service/:id", getCategoryService);
protectedRouter.put(
  "/deactivate-category-service/:id",
  deactivateCategoryService
);
protectedRouter.put("/update-category-service/:id", updateCategoryService);

// Currency
protectedRouter.post("/currency", addCurrency);
protectedRouter.get("/currencies", getCurrencies);
protectedRouter.delete("/delete-currency/:id", deleteCurrency);
protectedRouter.post(
  "/currency-bulkupload",
  upload.single("file"),
  currencyBulkUpload
);
protectedRouter.get("/currency/:id", getCurrency);
protectedRouter.put("/deactivate-currency/:id", deactivateCurrency);
protectedRouter.put("/update-currency/:id", updateCurrency);

// User Permission And Invite
protectedRouter.post("/invite-admin", inviteAdmin);
router.get("/accept-invite", acceptInvite);
protectedRouter.get("/get-admin-users", getAdminUsersList);
protectedRouter.post("/transfer-ownership/:user_id", transferOwnerShip);
protectedRouter.put("/deactivate-user/:user_id", deactivateUser);
protectedRouter.get("/get-employee-users", getOrganizationEmployeeList);
protectedRouter.post("/invite-users", inviteUsers);
protectedRouter.put("/update-user/:id", updateUser);
protectedRouter.post(
  "/invite-users-bulkupload",
  upload.single("file"),
  inviteUsersBulkUpload
);
protectedRouter.post("/get-users-by-ids", getUsersByIds);
// Role
protectedRouter.post("/role", addRole);
protectedRouter.get("/roles", getRoles);
protectedRouter.get("/role/:id", getRole);
protectedRouter.put("/update-role/:id", updateRole);
protectedRouter.delete("/delete-role/:id", deleteRole);
protectedRouter.put("/deactivate-role/:id", deactivateRole);

// Modules
protectedRouter.get("/permission-modules", getPermissionModules);

// Workflow
protectedRouter.post("/approval-workflow", addWorkflow);
protectedRouter.get("/approval-workflow-list", getWorkflowList);
protectedRouter.post("/approval-work-flow-structure", addCreateWorkflowSteps);
protectedRouter.get("/approval-workflow/:id", getApprovalWorkflowById);
protectedRouter.get(
  "/get-approval-workflow/:subsidiary_id/:subsidiary_branch_id/:branch_department_id",
  getApprovalWorkflowByIds
);
protectedRouter.get(
  "/users/:subsidiary_id/:subsidiary_branch_id/:branch_department_id",
  getUsersForApprovalWorkflow
);

// Invite Supppliers
protectedRouter.get("/suppliers", getSuppliers);
protectedRouter.get("/filter-options", getSupplierFilterOptions);
protectedRouter.post("/invite-suppliers", inviteSuppliers);
protectedRouter.get("/suppliers/:id", getSupplierById);
protectedRouter.post("/suppliers/:id", updateSupplierStatus);
// protectedRouter.put("/supplier/:id", updateSupplier);
// protectedRouter.delete("/supplier/:id", deleteSupplier);

// Module Setting
protectedRouter.post("/upsert-module", upsertOrganizationSettings);
protectedRouter.get("/modules", getModules);

// Attach the sub-router
router.use(protectedRouter);

export default router;
