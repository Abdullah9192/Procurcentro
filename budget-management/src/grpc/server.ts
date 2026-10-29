import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../protos";
import { budgetItemService, budgetService } from "./services/BudgetGrpcService";

export function startGrpcServer() {
  const server = new grpc.Server();

  const budgetProto = loadedProtos.budget.budget;
  
  server.addService(budgetProto.BudgetService.service, budgetService);
  server.addService(budgetProto.BudgetItemService.service, budgetItemService);

  server.bindAsync("0.0.0.0:50055", grpc.ServerCredentials.createInsecure(), () => {
    console.log("✅ Budget gRPC server running on port 50055");
  });
}
