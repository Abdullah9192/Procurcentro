import {
  getBranchById,
  getDepartmentById,
  getUserById,
  getOrgCategoryById,
  getOrgCurrencyById,
  getSubsidiaryById,
  getOrganizationById,
} from "../../grpc/clients/AdminGrpcClient";
import { getBudgetById, getBudgetItemById } from "../../grpc/clients/BudgetGrpcClient";

export const resolveRequisitionRelations = async (requisition: any) => {
  const reqPlain = requisition.toJSON ? requisition.toJSON() : requisition;

  const [
    organization,
    subsidiary,
    branch,
    department,
    createdBy,
    lastActionBy,
  ] = await Promise.all([
    reqPlain.organization_id ? getOrganizationById(reqPlain.organization_id).catch(() => null) : null,
    reqPlain.subsidiary_id ? getSubsidiaryById(reqPlain.subsidiary_id).catch(() => null) : null,
    reqPlain.subsidiary_branch_id ? getBranchById(reqPlain.subsidiary_branch_id).catch(() => null) : null,
    reqPlain.branch_department_id ? getDepartmentById(reqPlain.branch_department_id).catch(() => null) : null,
    reqPlain.created_by ? getUserById(reqPlain.created_by).catch(() => null) : null,
    reqPlain.last_action_by ? getUserById(reqPlain.last_action_by).catch(() => null) : null,
  ]);

  // Enrich external_items if present
  let enrichedExternalItems = [];
  if (reqPlain.external_items && Array.isArray(reqPlain.external_items)) {
    enrichedExternalItems = await Promise.all(
      reqPlain.external_items.map(async (item: any) => {
        const [orgCategory, budget, budgetItem, orgCurrency] = await Promise.all([
          item.org_category_id ? getOrgCategoryById(item.org_category_id).catch(() => null) : null,
          item.budget_id ? getBudgetById(item.budget_id).catch(() => null) : null,
          item.budget_item_id ? getBudgetItemById(item.budget_item_id).catch(() => null) : null,
          item.org_currency_id ? getOrgCurrencyById(item.org_currency_id).catch(() => null) : null,
        ]);
        return {
          ...item,
          org_category: orgCategory,
          budget,
          budget_item: budgetItem,
          org_currency: orgCurrency,
        };
      })
    );
  }

  return {
    ...reqPlain,
    organization,
    subsidiary,
    branch,
    department,
    requested_user: createdBy,
    last_action_by: lastActionBy,
    external_items: enrichedExternalItems,
  };
};
