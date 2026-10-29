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

const grpcObject = grpc.loadPackageDefinition(packageDef) as any;
const client = new grpcObject.services.NotificationService(
  "localhost:50054",
  grpc.credentials.createInsecure()
);

// ✅ Make sure this object matches the proto exactly (no nested "notification" key)
const testNotification = {
  sender_id: "033f63ab-86ab-4620-883e-8c55f50eac96",
  receiver_id: "0abf7053-53d2-494a-a648-8a36f642c968",
  organization_id: "e11578c2-6021-4126-aa58-9f6083a98f15",
  notification_type: "info",
  notification_module: "test_module",
  message: "🎉 This is a test notification",
  subsidiary_id: "1039f87e-7f5c-4251-bfc1-df249be36b58",
};

client.SendNotification(testNotification, (err: any, response: any) => {
  if (err) console.error("❌ Error:", err);
  else console.log("✅ SendNotification response:", response);
});
