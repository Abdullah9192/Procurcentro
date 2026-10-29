import * as grpc from "@grpc/grpc-js";
import Organization from "../../app/models/Organization";
import Subsidiary from "../../app/models/Subsidiary";
import SubsidiaryBranch from "../../app/models/SubsidiaryBranch";
import BranchDepartment from "../../app/models/BranchDepartment";
import User from "../../app/models/User";
import OrgCategory from "../../app/models/OrgCategory";
import ApprovalWorkflow from "../../app/models/ApprovalWorkflow";
import OrgCurrency from "../../app/models/OrgCurrency";
import OrgSubCategory from "../../app/models/OrgSubCategory";
const notFoundError = (entity: string) => ({
  code: grpc.status.NOT_FOUND,
  message: `${entity} not found`,
});
export const organizationService = {
  GetOrganizationById: async (call: any, callback: any) => {
    try {
      // ✅ Validate request
      if (!call?.request || !call.request.id) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Organization id is required",
        });
      }

      const { id } = call.request;

      const org = await Organization.findByPk(id);

      if (!org) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Organization not found",
        });
      }

      const user = await User.findOne({
        where: {
          organization_id: id,
          user_type: "admin",
          is_owner: true,
        },
      });

      return callback(null, {
        id: org.id,
        name: org.name,
        address: org.address,
        phone_number: org.primary_contact_number,
        contact_name: user?.name ?? "N/A",
        user_id: user?.id ?? "",
      });
    } catch (error: any) {
      console.error("GetOrganizationById error:", error);

      return callback({
        code: 13, // INTERNAL
        message: "Internal server error",
      });
    }
  },
};
export const subsidiaryService = {
  GetSubsidiaryById: async (call: any, callback: any) => {
    const { id } = call.request;
    const sub = await Subsidiary.findByPk(id);
    if (!sub) return callback(notFoundError("Subsidiary"));
    callback(null, {
      id: sub.id,
      subsidiary_name: sub.subsidiary_name,
      organization_id: sub.organization_id,
      is_active: sub.is_active,
    });
  },
};
export const branchService = {
  GetBranchById: async (call: any, callback: any) => {
    const { id } = call.request;
    const branch = await SubsidiaryBranch.findByPk(id);
    console.log("Fetched branch Grpc:", branch);
    if (!branch) return callback(notFoundError("Branch"));
    callback(null, {
      id: branch.id,
      branch_name: branch.branch_name,
      subsidiary_id: branch.subsidiary_id,
      is_active: branch.is_active,
    });
  },
};
export const departmentService = {
  GetDepartmentById: async (call: any, callback: any) => {
    const { id } = call.request;
    const dept = await BranchDepartment.findByPk(id);
    console.log("Fetched department Grpc:", dept);
    if (!dept) return callback(notFoundError("Department"));
    callback(null, {
      id: dept.id,
      department_name: dept.department_name,
      subsidiary_branch_id: dept.subsidiary_branch_id,
      is_active: dept.is_active,
    });
  },
};
export const userService = {
  GetUserById: async (call: any, callback: any) => {
    const { id } = call.request;
    const user = await User.findByPk(id);
    console.log("Fetched user Grpc:", user);
    if (!user) return callback(notFoundError("User"));
    // Map Sequelize user → gRPC UserResponse
    const userResponse = {
      id: user.id,
      user_id_no: user.user_id_no,
      name: user.name,
      email: user.email,
      password: user.password, // :warning: usually you shouldn't send password back
      country: user.country,
      is_email_verified: user.is_email_verified,
      is_supplier_capable: user.is_supplier_capable,
      supplier_status: user.supplier_status,
      supplier_status_reason: user.supplier_status_reason,
      supplier_approval_type: user.supplier_approval_type,
      google_id: user.google_id,
      microsoft_id: user.microsoft_id,
      is_owner: user.is_owner,
      user_type: user.user_type,
      org_role_id: user.org_role_id,
      organization_id: user.organization_id,
      email_verification_token: user.email_verification_token,
      email_verification_expires:
        user.email_verification_expires?.toISOString?.() || "",
      reset_password_token: user.reset_password_token,
      reset_password_expires:
        user.reset_password_expires?.toISOString?.() || "",
      subsidiary_branch_id: user.subsidiary_branch_id,
      branch_department_id: user.branch_department_id,
      subsidiary_id: user.subsidiary_id,
      is_head_department: user.is_head_department,
      onboard_completed: user.onboard_completed,
      stepper: user.stepper,
      is_active: user.is_active,
      created_by: user.created_by,
      message: "User fetched successfully",
    };
    return callback(null, userResponse);
  },
};
export const orgCategoryService = {
  GetOrgCategoryById: async (call: any, callback: any) => {
    const { id } = call.request;
    const cat = await OrgCategory.findByPk(id);
    if (!cat) return callback(notFoundError("OrgCategory"));
    callback(null, {
      id: cat.id,
      category_name: cat.category_name,
      is_active: cat.is_active,
    });
  },
};
export const orgSubCategoryService = {
  GetOrgSubCategoryById: async (call: any, callback: any) => {
    const { id } = call.request;
    const cat = await OrgSubCategory.findByPk(id);
    if (!cat) return callback(notFoundError("OrgSubCategory"));
    callback(null, {
      id: cat.id,
      name: cat.name,
      is_active: cat.is_active,
    });
  },
};
export const workflowService = {
  GetWorkflowById: async (call: any, callback: any) => {
    const { id } = call.request;
    const flow = await ApprovalWorkflow.findByPk(id);
    if (!flow) return callback(notFoundError("Workflow"));
    callback(null, {
      id: flow.id,
      name: flow.name,
      approval_type: flow.approval_type,
      is_active: flow.is_active,
    });
  },
};
export const currencyService = {
  GetOrgCurrencyById: async (call: any, callback: any) => {
    const { id } = call.request;
    const currency = await OrgCurrency.findByPk(id);
    if (!currency) return callback(notFoundError("Currency"));
    callback(null, {
      id: currency.id,
      currency: currency.currency,
      is_active: currency.is_active,
    });
  },
};
