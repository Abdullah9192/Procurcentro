import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../protos";
import { supplierService } from "./services/SupplierGrpcServices";
import { GRPC_PORT } from "../config/EnvVariables";

export function startGrpcServer() {
  const server = new grpc.Server();

  const supplierProto = loadedProtos.supplier.supplier;

  server.addService(supplierProto.SupplierService.service, supplierService);

  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log(`✅ Supplier gRPC server running on port ${GRPC_PORT}`);
    }
  );
}
