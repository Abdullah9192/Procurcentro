import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const BUDGET_PROTO_PATH = path.join(__dirname, "../../protos/budget.proto");
const BUDGET_SERVICE_URL = "budget-service:50055";

const packageDefinition = protoLoader.loadSync(BUDGET_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

if (!proto.budget) {
    throw new Error("Budget package not found in proto definition");
}

const credentials = grpc.credentials.createInsecure();

export const budgetClient = new proto.budget.BudgetService(BUDGET_SERVICE_URL, credentials);
export const budgetItemClient = new proto.budget.BudgetItemService(BUDGET_SERVICE_URL, credentials);

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

export const getBudgetById = promisify(budgetClient, "GetBudgetById");
export const getBudgetItemById = promisify(budgetItemClient, "GetBudgetItemById");


export const grpcBudgetClients = {
    budgetClient,
    budgetItemClient,
};