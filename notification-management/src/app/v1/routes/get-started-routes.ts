// import { Router } from "express";
// import {
//   getOrgSteppers,
//   updateOrganization,
//   addSubsidiaries,
//   addBranches,
//   addDepartments,
//   subsidiaryBulkUpload,
//   getOrgSubsidiary,
//   getOrgBranch,
//   getOrgDepartment,
//   branchBulkUpload,
//   departmentBulkUpload,
// } from "../../app/controllers/admin/get-started/ProfileController";
// import {
//   addCategory,
//   addCategoryItem,
//   addCategoryService,
//   addCurrency,
//   categoryBulkUpload,
//   categoryItemBulkUpload,
//   categoryServiceBulkUpload,
//   currencyBulkUpload,
//   getCategories,
//   getCategory,
//   getCurrency,
// } from "../../app/controllers/admin/get-started/SystemSettingController";
// import { createMulterUploader } from "../../app/middlewares/MulterMiddleware";
// import { authMiddleware } from "../../app/middlewares/AuthMiddleware";
// import {
//   addOrgRole,
//   deactivateUser,
//   getAdminUsersList,
//   getAvailableModules,
//   getOrganizationEmployeeList,
//   getUsersList,
//   transferOwnerShip,
// } from "../../app/controllers/admin/auth/AuthController";
// import { inviteSupplier } from "../../app/controllers/admin/get-started/InviteSupplierController";
// import {
//   createApprovalWorkflow,
//   approvalWorkflowStructure,
//   approvalWorkflowList,
// } from "../../app/controllers/admin/get-started/ApprovalController";
// import {
//   getOrgRoles,
//   addUser,
//   addAdmin,
//   usersBulkUpload,
// } from "../../app/controllers/admin/get-started/PermissionInviteController";
// import { multipartParser } from "../../app/middlewares/MultiParserMiddleware";
// const router = Router();

// const excelUploader = createMulterUploader({
//   folder: "excels",
//   allowedFormats: ["xls", "xlsx", "csv"],
//   useDisk: true,
// });
// // Steppers Page Detail
// router.get("/:organization_id", authMiddleware, getOrgSteppers);

// // Organization Profile Setup
// router.put("/update-profile", multipartParser, updateOrganization);
// router.post("/add-subsidiary", addSubsidiaries);
// router.post("/add-branch", addBranches);
// router.post("/add-department", addDepartments);

// router.post("/subsidiary-bulkupload", excelUploader.single("file"), subsidiaryBulkUpload);
// router.post("/branch-bulkupload", excelUploader.single("file"), branchBulkUpload);
// router.post("/department-bulkupload", excelUploader.single("file"), departmentBulkUpload);

// // System Settings & Configuration
// router.post("/add-category", addCategory);
// router.post("/category-bulkupload", excelUploader.single("file"), categoryBulkUpload);
// router.post("/add-category-item", addCategoryItem);
// router.post("/category-item-bulkupload", excelUploader.single("file"), categoryItemBulkUpload);
// router.post("/add-category-service", addCategoryService);
// router.post("/category-service-bulkupload", excelUploader.single("file"), categoryServiceBulkUpload);
// router.post("/add-currency", addCurrency);
// router.post("/currecy-bulkupload", excelUploader.single("file"), currencyBulkUpload);
// router.get("/categories/:organization_id", getCategories);

// router.get("/get-currency/:organization_id", getCurrency);
// router.get("/get-category/:organization_id", getCategory);


// // Set Permissions And Invite Users
// router.get("/get-employees-users/:organization_id", getOrganizationEmployeeList);
// router.patch("/:organization_id/deactivate-user/:user_id", deactivateUser);
// router.get("/get-admin-users/:organization_id", getAdminUsersList);
// router.post("/transfer-ownership", transferOwnerShip);

// router.get("/get-users/:subsidiary_id/:subsidiary_branch_id/:branch_department_id", getUsersList);

// // router.post("/get-roles",  getRoles);
// router.post("/add-role", addOrgRole);
// router.get("/get-role-modules", getAvailableModules);

// // Supplier / Vendor Invites
// router.post("/create-supplier", inviteSupplier);

// // Approval Work Flow
// router.post("/create-approval-work-flow", createApprovalWorkflow);
// router.post("/approval-work-flow-structure", approvalWorkflowStructure);
// router.get("/approval-work-flow-list/:organization_id", approvalWorkflowList);

// router.get("/:organization_id/get-roles", getOrgRoles);

// router.get("/subsidiaries/:organization_id", getOrgSubsidiary);
// router.get("/branches/:organization_id/:subsidiary_id", getOrgBranch);
// router.get("/departments/:organization_id/:subsidiary_id/:subsidiary_branch_id", getOrgDepartment);

// router.post("/create-user", addUser);
// router.post("/user-bulkupload", excelUploader.single("file"), usersBulkUpload);
// router.post("/create-admin", authMiddleware, addAdmin);

// export default router;
