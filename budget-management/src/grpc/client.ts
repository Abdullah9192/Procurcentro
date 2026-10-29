import {
  getOrganizationById,
  getSubsidiaryById,
  getBranchById,
  getDepartmentById,
  getUserById,
  getOrgCategoryById,
  getWorkflowById,
  getOrgCurrencyById,
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
};
