import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const SUPPLIER_PROTO_PATH = path.join(__dirname, "../../protos/supplier.proto");
const SUPPLIER_SERVICE_URL = "vendor-service:50052";

const packageDefinition = protoLoader.loadSync(SUPPLIER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

if (!proto.supplier) {
    throw new Error("Supplier package not found in proto definition");
}

const credentials = grpc.credentials.createInsecure();


export const supplierClient = new proto.supplier.SupplierService(SUPPLIER_SERVICE_URL, credentials);


const promisify = (client: any, methodName: string) => {
    return (id: string) =>
        new Promise((resolve, reject) => {
            if (!client) {
                return reject(new Error(`Client is null for method ${methodName}`));
            }

            client[methodName]({ id }, (err: any, response: any) => {
                if (err) return reject(err);
                resolve(response);
            });
        });
};

export const getSupplierById = promisify(supplierClient, "GetSupplierById");

export const grpcSupplierClients = {
   supplierClient,
};