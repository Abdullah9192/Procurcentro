
import { getSupplierById } from "../../grpc/clients/SupplierGrpcClient";

export const resolveSupplierRelations = async (requisition: any) => {
    const reqPlain = requisition.toJSON ? requisition.toJSON() : requisition;
    const [
        vendorDetail
    ] = await Promise.all([
        reqPlain.selected_supplier_id ? getSupplierById(reqPlain.selected_supplier_id).catch(() => null) : null,
    ]);

    return {
        ...reqPlain,
        selected_supplier:vendorDetail
    };
};
