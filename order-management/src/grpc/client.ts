
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
import { getRequisitionById } from "./clients/RequisitionGrpcClient";
import { getSupplierById } from "./clients/SupplierGrpcClient";

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
  getSupplierById,
  getRequisitionById
};
