// src/utils/resolveBudgetRelations.ts

import {
  getBranchById,
  getDepartmentById,
  getUserById,
  getOrgCategoryById,
  getOrgCurrencyById,
} from "../../grpc/clients/AdminGrpcClient";

export const resolveBudgetRelations = async (budget: any) => {
  const [
    branch,
    department,
    createdBy,
    orgCategory,
    orgCurrency,
  ] = await Promise.all([
    budget.subsidiary_branch_id ? getBranchById(budget.subsidiary_branch_id).catch(() => null) : null,
    budget.branch_department_id ? getDepartmentById(budget.branch_department_id).catch(() => null) : null,
    budget.created_by ? getUserById(budget.created_by).catch(() => null) : null,
    budget.org_category_id ? getOrgCategoryById(budget.org_category_id).catch(() => null) : null,
    budget.org_currency_id ? getOrgCurrencyById(budget.org_currency_id).catch(() => null) : null
  ]);

  return {
    ...budget,
    branch,
    department,
    requested_user: createdBy,
    org_category: orgCategory,
    org_currency: orgCurrency,
  };
};
