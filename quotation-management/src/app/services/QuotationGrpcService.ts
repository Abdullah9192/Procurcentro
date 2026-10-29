import {
  getBranchById,
  getDepartmentById,
  getUserById,
  getSubsidiaryById,
  getOrganizationById,
  getOrgCategoryById,
  getOrgCurrencyById,
} from "../../grpc/clients/AdminGrpcClient";
import { getSupplierById } from "../../grpc/clients/SupplierGrpcClient";

export const resolveQuatationRelations = async (quotation: any) => {
  const [subsidiary, branch, department, createdBy, selected_supplier] = await Promise.all([
    quotation.subsidiary_id ? getSubsidiaryById(quotation.subsidiary_id).catch(() => null) : null,
    quotation.subsidiary_branch_id ? getBranchById(quotation.subsidiary_branch_id).catch(() => null) : null,
    quotation.branch_department_id ? getDepartmentById(quotation.branch_department_id).catch(() => null) : null,
    quotation.created_by ? getUserById(quotation.created_by).catch(() => null) : null,
    quotation.selected_supplier_id ? getSupplierById(quotation.selected_supplier_id).catch(() => null) : null,
  ]);

  // Enrich quotation_line_item_suppliers for each supplier
  if (quotation.suppliers && Array.isArray(quotation.suppliers)) {
    for (const supplier of quotation.suppliers) {
      if (supplier.quotation_line_item_suppliers && Array.isArray(supplier.quotation_line_item_suppliers)) {
        for (const item of supplier.quotation_line_item_suppliers) {
          const [organization, org_category, org_currency] = await Promise.all([
            item.organization_id ? getOrganizationById(item.organization_id).catch(() => null) : null,
            item.org_category_id ? getOrgCategoryById(item.org_category_id).catch(() => null) : null,
            item.org_currency_id ? getOrgCurrencyById(item.org_currency_id).catch(() => null) : null,
          ]);
          item.buyer = organization;
          item.org_category = org_category;
          item.org_currency = org_currency;
        }
      }
    }
  }

  return {
    ...quotation,
    subsidiary,
    branch,
    department,
    requested_user: createdBy,
    selected_supplier,
  };
};
