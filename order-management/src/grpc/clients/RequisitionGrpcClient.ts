import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const REQUISITION_PROTO_PATH = path.join(__dirname, "../../protos/requisition.proto");
const REQUISITION_SERVICE_URL = "requisition-service:50056";

const packageDefinition = protoLoader.loadSync(REQUISITION_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

if (!proto.requisition) {
    throw new Error("Requisition package not found in proto definition");
}

const credentials = grpc.credentials.createInsecure();

export const requisitionClient = new proto.requisition.RequisitionService(REQUISITION_SERVICE_URL, credentials);


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

export const getRequisitionById = promisify(requisitionClient, "GetRequisitionById");


export const grpcAdminClients = {
    getRequisitionById,
};