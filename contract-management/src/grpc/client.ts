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
import { getBudgetById, getBudgetItemById } from "./clients/BudgetGrpcClient";

export const grpcClients = {
  getOrganizationById,
  getSubsidiaryById,
  getBranchById,
  getDepartmentById,
  getUserById,
  getOrgCategoryById,
  getWorkflowById,
  getOrgCurrencyById,
  getApprovalWorkFlowById ,
  getBudgetById,
  getBudgetItemById,
};
