import {
  getBranchById,
  getDepartmentById,
  getUserById,
  getSubsidiaryById,
  getOrganizationById,
  getOrgCategoryById,
  getOrgCurrencyById,
} from "../../grpc/clients/AdminGrpcClient";
import { getRequisitionById } from "../../grpc/clients/RequisitionGrpcClient";
import { getSupplierById } from "../../grpc/clients/SupplierGrpcClient";
export const resolvePurchaseOrderRelations = async (order: any) => {
  const [
    organization,
    subsidiary,
    branch,
    department,
    createdBy,
    requisition,
    approvedBy,
    supplier_data,
  ] = await Promise.all([
    order.organization_id
      ? getOrganizationById(order.organization_id).catch(() => null)
      : null,
    order.subsidiary_id
      ? getSubsidiaryById(order.subsidiary_id).catch(() => null)
      : null,
    order.subsidiary_branch_id
      ? getBranchById(order.subsidiary_branch_id).catch(() => null)
      : null,
    order.branch_department_id
      ? getDepartmentById(order.branch_department_id).catch(() => null)
      : null,
    order.created_by ? getUserById(order.created_by).catch(() => null) : null,
    order.requisition_id
      ? getRequisitionById(order.requisition_id).catch(() => null)
      : null,
    order.last_action_by
      ? getUserById(order.last_action_by).catch(() => null)
      : null,
    order.selected_supplier_id
      ? getSupplierById(order.selected_supplier_id).catch(() => null)
      : null,
  ]);

  // fetch requisition.created_by user if requisition exists
  let requisitionCreatedBy: any = null;
  if ((requisition as any)?.created_by) {
    requisitionCreatedBy = await getUserById(
      (requisition as any).created_by
    ).catch(() => null);
  }
  // Add org_category and currency to each line item
  const enrichedLineItems = await Promise.all(
    (order.items || []).map(async (item: any) => {
      const [orgCategory, currency] = await Promise.all([
        item.org_category_id
          ? getOrgCategoryById(item.org_category_id).catch(() => null)
          : null,
        item.org_currency_id
          ? getOrgCurrencyById(item.org_currency_id).catch(() => null)
          : null,
      ]);
      return {
        ...item,
        org_category: orgCategory,
        currency: currency,
      };
    })
  );
  return {
    ...order,
    buyer: organization,
    subsidiary,
    branch,
    department,
    selected_supplier_data: supplier_data,
    requested_user: createdBy,
    approval_user: approvedBy,
    items: enrichedLineItems,
    requisition: requisition
      ? {
          ...requisition,
          created_user: requisitionCreatedBy,
        }
      : null,
  };
};
