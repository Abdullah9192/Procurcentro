import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../../protos";
import { grpcUrl } from "../../config/EnvVariables";

const adminPackage = loadedProtos.admin.admin;
const ADMIN_SERVICE_URL = grpcUrl.ADMIN_GRPC_URL || "admin-service:50051";

// Utility to create a gRPC client
const createClient = (Service: any) => {
  return new Service(ADMIN_SERVICE_URL, grpc.credentials.createInsecure());
};

// Clients
const organizationClient = createClient(adminPackage.OrganizationService);
const subsidiaryClient = createClient(adminPackage.SubsidiaryService);
const branchClient = createClient(adminPackage.BranchService);
const departmentClient = createClient(adminPackage.DepartmentService);
const userClient = createClient(adminPackage.UserService);
const orgCategoryClient = createClient(adminPackage.OrgCategoryService);
const workflowClient = createClient(adminPackage.WorkflowService);
const currencyClient = createClient(adminPackage.OrgCurrencyService);

// Helper Promisified Call
const promisify = (client: any, methodName: string) => {
  return (id: string) =>
    new Promise((resolve, reject) => {
      client[methodName]({ id }, (err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
};

// Exported Functions
export const getOrganizationById = promisify(organizationClient, "GetOrganizationById");
export const getSubsidiaryById = promisify(subsidiaryClient, "GetSubsidiaryById");
export const getBranchById = promisify(branchClient, "GetBranchById");
export const getDepartmentById = promisify(departmentClient, "GetDepartmentById");
export const getUserById = promisify(userClient, "GetUserById");
export const getOrgCategoryById = promisify(orgCategoryClient, "GetOrgCategoryById");
export const getWorkflowById = promisify(workflowClient, "GetWorkflowById");
export const getOrgCurrencyById = promisify(currencyClient, "GetOrgCurrencyById");
// Optional: Export raw clients (if needed elsewhere)
export const grpcAdminClients = {
  organizationClient,
  subsidiaryClient,
  branchClient,
  departmentClient,
  userClient,
  orgCategoryClient,
  workflowClient,
  currencyClient,
};
