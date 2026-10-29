import {
  getOrganizationById,
  getSubsidiaryById,
  getUserById,
  getOrgCategoryById,
  getOrgSubCategoryById
} from "./clients/AdminGrpcClient";

export const grpcClients = {
  getOrganizationById,
  getSubsidiaryById,
  getUserById,
  getOrgCategoryById,
  getOrgSubCategoryById
};
