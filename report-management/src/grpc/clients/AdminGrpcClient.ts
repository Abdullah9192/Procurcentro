import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const ADMIN_PROTO_PATH = path.join(__dirname, "../../protos/admin.proto");
const ADMIN_SERVICE_URL = "admin-service:50051";

const packageDefinition = protoLoader.loadSync(ADMIN_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

if (!proto.admin) {
    throw new Error("Admin package not found in proto definition");
}

const credentials = grpc.credentials.createInsecure();

export const organizationClient = new proto.admin.OrganizationService(ADMIN_SERVICE_URL, credentials);
export const subsidiaryClient = new proto.admin.SubsidiaryService(ADMIN_SERVICE_URL, credentials);
export const branchClient = new proto.admin.BranchService(ADMIN_SERVICE_URL, credentials);
export const departmentClient = new proto.admin.DepartmentService(ADMIN_SERVICE_URL, credentials);
export const userClient = new proto.admin.UserService(ADMIN_SERVICE_URL, credentials);
export const orgCategoryClient = new proto.admin.OrgCategoryService(ADMIN_SERVICE_URL, credentials);
export const workflowClient = new proto.admin.WorkflowService(ADMIN_SERVICE_URL, credentials);
export const currencyClient = new proto.admin.OrgCurrencyService(ADMIN_SERVICE_URL, credentials);


export const approvalWorkFlowClient = null;

const promisify = (client: any, methodName: string) => {
    return (id: string) =>
        new Promise((resolve, reject) => {
            if (!client) {
                return reject(new Error(`Client is null for method ${methodName}`));
            }

            client[methodName]({ id }, (err: any, response: any) => {
                if (err) return reject(err);
                resolve(response);
            });
        });
};

export const getOrganizationById = promisify(organizationClient, "GetOrganizationById");
export const getSubsidiaryById = promisify(subsidiaryClient, "GetSubsidiaryById");
export const getBranchById = promisify(branchClient, "GetBranchById");
export const getDepartmentById = promisify(departmentClient, "GetDepartmentById");
export const getUserById = promisify(userClient, "GetUserById");
export const getOrgCategoryById = promisify(orgCategoryClient, "GetOrgCategoryById");
export const getWorkflowById = promisify(workflowClient, "GetWorkflowById");
export const getOrgCurrencyById = promisify(currencyClient, "GetOrgCurrencyById");

export const getApprovalWorkFlowById = approvalWorkFlowClient ?
    promisify(approvalWorkFlowClient, "getApprovalWorkFlowById") :
    () => Promise.reject(new Error("ApprovalWorkFlowService not implemented"));

export const grpcAdminClients = {
    organizationClient,
    subsidiaryClient,
    branchClient,
    departmentClient,
    userClient,
    orgCategoryClient,
    workflowClient,
    currencyClient,
    approvalWorkFlowClient
};