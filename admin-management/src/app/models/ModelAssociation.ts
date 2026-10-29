import User from "./User";
import OrgRole from "./OrgRole";
import Organization from "./Organization";
import Subsidiary from "./Subsidiary";
import SubsidiaryBranch from "./SubsidiaryBranch";
import BranchDepartment from "./BranchDepartment";
import OrgCategory from "./OrgCategory";
import OrgSubCategory from "./OrgSubCategory";
import OrgCategoryService from "./OrgCategoryService";
import OrgCurrency from "./OrgCurrency";
import OrgRoleModulePermission from "./OrgRoleModulePermission";
import ApprovalWorkflow from "./ApprovalWorkflow";
import ApprovalWorkflowStep from "./ApprovalWorkflowStep";
import ApprovalWorkflowStepApprover from "./ApprovalWorkflowStepApprover";
import Widget from "./Widget";
import AdminDashboardWidget from "./AdminDashboardWidget";
import AdminPortal from "./AdminPortal";
import OrganizationSetting from "./OrganizationSetting";
import Module from "./Module";

export const defineModelAssociations = () => {
  // User associations
  User.belongsTo(OrgRole, {
    foreignKey: "org_role_id",
    as: "org_role",
  });

  User.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });

  User.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
  });

  User.belongsTo(Subsidiary, {
    foreignKey: "subsidiary_id",
    as: "subsidiary",
  });

  User.belongsTo(SubsidiaryBranch, {
    foreignKey: "subsidiary_branch_id",
    as: "subsidiary_branch",
  });

  User.belongsTo(BranchDepartment, {
    foreignKey: "branch_department_id",
    as: "branch_department",
  });

  // Subsidiary associations
  Subsidiary.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });

  Subsidiary.hasMany(SubsidiaryBranch, {
    foreignKey: "subsidiary_id",
    as: "branches",
  });

  Subsidiary.hasMany(BranchDepartment, {
    foreignKey: "subsidiary_id",
    as: "departments",
  });

  // SubsidiaryBranch associations
  SubsidiaryBranch.belongsTo(Subsidiary, {
    foreignKey: "subsidiary_id",
    as: "subsidiary",
  });

  // BranchDepartment associations
  BranchDepartment.belongsTo(Subsidiary, {
    foreignKey: "subsidiary_id",
    as: "subsidiary",
  });

  BranchDepartment.belongsTo(SubsidiaryBranch, {
    foreignKey: "subsidiary_branch_id",
    as: "subsidiary_branch",
  });

  // OrgCategory associations
  OrgCategory.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  OrgCategory.hasMany(OrgSubCategory, {
    foreignKey: "org_category_id",
    as: "org_sub_categories",
  });

  OrgCategory.hasMany(OrgCategoryService, {
    foreignKey: "org_category_id",
    as: "services",
  });

  // OrgCatalogueItem associations
  OrgSubCategory.belongsTo(OrgCategory, {
    foreignKey: "org_category_id",
    as: "category",
    onDelete: "CASCADE",
  });

  OrgSubCategory.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  // OrgCategoryService associations
  OrgCategoryService.belongsTo(OrgCategory, {
    foreignKey: "org_category_id",
    as: "category",
    onDelete: "CASCADE",
  });

  OrgCategoryService.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  // OrgCurrency associations
  OrgCurrency.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  // OrgRole associations
  OrgRole.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });

  OrgRole.hasMany(OrgRoleModulePermission, {
    foreignKey: "org_role_id",
    as: "org_role_module_permissions",
  });

  // OrgRoleModulePermission associations
  OrgRoleModulePermission.belongsTo(OrgRole, {
    foreignKey: "org_role_id",
    as: "org_role",
  });

  OrgRoleModulePermission.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
  });

  OrgRoleModulePermission.belongsTo(Module, {
    foreignKey: "module_id",
    as: "module",
  });

  // ApprovalWorkflow associations
  ApprovalWorkflow.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  ApprovalWorkflow.hasMany(ApprovalWorkflowStep, {
    foreignKey: "workflow_id",
    as: "steps",
    onDelete: "CASCADE",
  });

  // ApprovalWorkflowStep associations
  ApprovalWorkflowStep.belongsTo(ApprovalWorkflow, {
    foreignKey: "workflow_id",
    as: "workflow",
    onDelete: "CASCADE",
  });

  ApprovalWorkflowStep.hasMany(ApprovalWorkflowStepApprover, {
    foreignKey: "step_id",
    as: "approvers",
    onDelete: "CASCADE",
  });

  // ApprovalWorkflowStepApprover associations
  ApprovalWorkflowStepApprover.belongsTo(ApprovalWorkflowStep, {
    foreignKey: "step_id",
    as: "step",
    onDelete: "CASCADE",
  });
  ApprovalWorkflowStepApprover.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });
  
  // AdminPortal associations
  AdminPortal.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  AdminPortal.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    onDelete: "CASCADE",
  });

  AdminPortal.belongsTo(Subsidiary, {
    foreignKey: "subsidiary_id",
    as: "subsidiary",
    onDelete: "CASCADE",
  });

  OrganizationSetting.belongsTo(Organization, {
    foreignKey: "organization_id",
    as: "organization",
    onDelete: "CASCADE",
  });

  OrganizationSetting.belongsTo(Subsidiary, {
    foreignKey: "subsidiary_id",
    as: "subsidiary",
    onDelete: "CASCADE",
  });

  OrganizationSetting.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Organization.hasMany(OrganizationSetting, {
    foreignKey: "organization_id",
    as: "settings",
  });

  Subsidiary.hasMany(OrganizationSetting, {
    foreignKey: "subsidiary_id",
    as: "settings",
  });

  User.hasMany(OrganizationSetting, {
    foreignKey: "created_by",
    as: "organization_settings",
  });

 
};
