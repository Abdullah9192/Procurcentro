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
const userClient = createClient(adminPackage.UserService);
const orgCategoryClient = createClient(adminPackage.OrgCategoryService);
const orgSubCategoryClient = createClient(adminPackage.OrgSubCategoryService);
const branchCategoryClient = createClient(adminPackage.BranchService);


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
export const getUserById = promisify(userClient, "GetUserById");
export const getOrgCategoryById = promisify(orgCategoryClient, "GetOrgCategoryById");
export const getOrgSubCategoryById = promisify(orgSubCategoryClient, "GetOrgSubCategoryById");
export const getBranchById = promisify(branchCategoryClient, "GetBranchById");

export const grpcAdminClients = {
  organizationClient,
  subsidiaryClient,
  userClient,
  orgCategoryClient,
  orgSubCategoryClient,
  branchCategoryClient,
};
