import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve("src/grpc/proto/notification.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDef) as grpc.GrpcObject;
const notificationPackage = (grpcObject as any).services;

function startGrpcServer() {
  const server = new grpc.Server();

  const PORT = process.env.GRPC_PORT || 50054;

  // ✅ Proper startup — no deprecated call
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("❌ gRPC Server failed to start:", err);
        return;
      }
      console.log(`🚀 Notification gRPC Server is running on port ${port}`);
    }
  );
}

// ✅ This actually starts the server when the file runs
startGrpcServer();
