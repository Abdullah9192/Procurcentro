import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../../protos";

// Load the `admin` package from the loaded protos
const adminPackage = loadedProtos.organization.admin;

// Create gRPC client instance
const client = new adminPackage.OrganizationService(
  "admin-service:50051", // or localhost:50051 in local
  grpc.credentials.createInsecure()
);

// Exported function using Promise wrapper
export const getOrganizationById = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    client.GetOrganizationById({ id }, (err: any, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

// Optional export for direct client usage
export const organizationClient = client;
