// src/grpc/client.ts
import { organizationClient, getOrganizationById } from "./clients/OrganizationClient";

export const grpcClients = {
  organizationClient,
  getOrganizationById,
};
