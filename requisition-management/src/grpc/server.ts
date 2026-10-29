import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../protos";
import { requisitionService } from "./services/RequisitionGrpcService";

export function startGrpcServer() {
  const server = new grpc.Server();

  const requisitionProto = loadedProtos.requisition.requisition;

  server.addService(
    requisitionProto.RequisitionService.service,
    requisitionService
  );

  server.bindAsync(
    "0.0.0.0:50056",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("✅ Requisition gRPC server running on port 50056");
    }
  );
}
