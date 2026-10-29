import {
  getOrganizationById,
  getSubsidiaryById,
  getBranchById,
  getDepartmentById,
  getUserById,
  getOrgCategoryById,
  getWorkflowById,
  getOrgCurrencyById,
  getApprovalWorkFlowById
} from "./clients/AdminGrpcClient";
export const grpcClients = {
  getOrganizationById,
  getSubsidiaryById,
  getBranchById,
  getDepartmentById,
  getUserById,
  getOrgCategoryById,
  getWorkflowById,
  getOrgCurrencyById,
  getApprovalWorkFlowById,
};
