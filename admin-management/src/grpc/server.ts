import * as grpc from "@grpc/grpc-js";
import { loadedProtos } from "../protos";

import {
  organizationService,
  subsidiaryService,
  branchService,
  departmentService,
  userService,
  orgCategoryService,
  workflowService,
  currencyService,
  orgSubCategoryService,
} from "./services/AdminGrpcService";

export function startGrpcServer() {
  const server = new grpc.Server();

  const adminProto = loadedProtos.admin.admin;

  server.addService(adminProto.OrganizationService.service,organizationService);
  server.addService(adminProto.SubsidiaryService.service, subsidiaryService);
  server.addService(adminProto.BranchService.service, branchService);
  server.addService(adminProto.DepartmentService.service, departmentService);
  server.addService(adminProto.UserService.service, userService);
  server.addService(adminProto.OrgCategoryService.service, orgCategoryService);
  server.addService(adminProto.OrgSubCategoryService.service,orgSubCategoryService);
  server.addService(adminProto.WorkflowService.service, workflowService);
  server.addService(adminProto.OrgCurrencyService.service, currencyService);

  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("✅ Admin gRPC server running on port 50051");
    }
  );
}
