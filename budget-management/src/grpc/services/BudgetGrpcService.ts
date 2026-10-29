import * as grpc from "@grpc/grpc-js";
import Budget from "../../app/models/Budget";
import BudgetItem from "../../app/models/BudgetItem";


const notFoundError = (entity: string) => ({
  code: grpc.status.NOT_FOUND,
  message: `${entity} not found`,
});

export const budgetService = {
  GetBudgetById: async (call: any, callback: any) => {
    const { id } = call.request;
    const budget = await Budget.findByPk(id);
    if (!budget) return callback(notFoundError("Budget"));
    callback(null, { 
      id: budget.id, 
      name: budget.name 
    });
  },
};

export const budgetItemService = {
  GetBudgetItemById: async (call: any, callback: any) => {
    const { id } = call.request;
    const budgetItem = await BudgetItem.findByPk(id);
    if (!budgetItem) return callback(notFoundError("Budget Item"));
    callback(null, {
      id: budgetItem.id,
    
    });
  },
};


