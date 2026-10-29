import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import fs from "fs";

const PROTO_DIR = path.resolve(__dirname);

const loadProto = (protoPath: string) => {
  const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDef);
};

export const loadedProtos: Record<string, any> = {};

fs.readdirSync(PROTO_DIR)
  .filter((file) => file.endsWith(".proto"))
  .forEach((file) => {
    const protoKey = path.basename(file, ".proto"); // e.g., "organization"
    const proto = loadProto(path.join(PROTO_DIR, `${protoKey}.proto`));
    loadedProtos[protoKey] = proto;
  });
