import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../../protos";

// Load the `admin` package from the loaded protos
const approvalPackage = loadedProtos.approvalworkflow.approvalworkflow;

// Create gRPC client instance
const client = new approvalPackage.ApprovalWorkFlowService(
  "admin-service:50051", // or localhost:50051 in local
  grpc.credentials.createInsecure()
);

// Exported function using Promise wrapper
export const getApprovalWorkFlowById = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    client.GetApprovalWorkFlowServiceById({ id }, (err: any, response: any) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

// Optional export for direct client usage
export const approvalWorkFlowClient = client;
