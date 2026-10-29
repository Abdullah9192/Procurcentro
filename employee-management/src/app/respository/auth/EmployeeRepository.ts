import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";


export const executeDashboardData = async (token: string) => {
    try {
        const requisitionsResponse = await http.get("v1/get-requisitions", undefined,{
            token,
            baseURL: service.REQUISITION_SERVICE_URL
        });
        
        // 🔹 Quotations API call
        const quotationsResponse = await http.get("v1/quotations", undefined,{
            token,
            baseURL: service.QUOTATION_SERVICE_URL
        });

        // 🔹 Purchase order API call
        const purchaseorderResponse = await http.get("v1/purchase-order", undefined,{
            token,
            baseURL: service.PURCHASE_ORDER_SERVICE_URL
        });

        // ✅ Apply filters
        const requisitions = requisitionsResponse.data?.data || [];
        const quotations = quotationsResponse.data?.data || [];
        const purchaseOrders = purchaseorderResponse?.data.data || [];


        // Count only `pending` requisitions
        const pendingRequisitionsCount = requisitions.filter(
            (req: any) => req.status === "pending"
        ).length;

        // Count only `pending_response` quotations
        const pendingQuotationsCount = quotations.filter(
            (q: any) => q.status === "pending_response"
        ).length;

        // Count only `awaiting_receipt` purchase orders
        const awaitingReceiptPOCount = purchaseOrders.filter(
            (po: any) => po.receiving_status === "awaiting_confirmation"
        ).length;

        return {
            success: true,
            statusCode: 200,
            message: "Data retrieved successfully.",
            data: {
                requisitions: pendingRequisitionsCount,
                quotations: pendingQuotationsCount,
                purchaseorder: awaitingReceiptPOCount,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            statusCode: error?.response?.status || 500,
            message: error?.response?.data?.message || "Failed to fetch data.",
        };
    }
};
