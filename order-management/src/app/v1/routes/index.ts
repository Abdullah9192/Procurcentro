import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { convertQuotationInOrder, createOrderComment, createOrderGRNDocument, getAllInvoiceRequestedOrders, getAllOrders, getAllPOController, getInvoiceDetail, getInvoiceListing, getOrderDetail, getOrders, getOrganizationOrderController, getReceivingDetail, getReceivingListing, getSupplierInvoiceById, getSupplierPOController, requestMultipleInvoiceSupplierItems, sendNotificationController, shareOrder, statusOrderSupplierLineItems, updateInvoiceData, updateIs3Way, updateOrderCommentStatus, updateOrderReceiving, updateOrderStatus, updateSupplierInvoiceStatus, updateSupplierItemsController, updateSupplierStatusController } from "../controllers/OrderController";

const router = Router()
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

//============= Admin Quotation Api's ==========
protectedRouter.post("/convert-quotation-order/:quotation_id", convertQuotationInOrder);
protectedRouter.get("/get-order/:id", getOrderDetail);
protectedRouter.put("/update-status/:id", updateOrderStatus);
protectedRouter.get("/get-orders", getOrders);
protectedRouter.get("/getorder", getAllOrders);
protectedRouter.post("/share/:order_id", shareOrder);

// =============== Admin Order Comments Api's ================
protectedRouter.post("/comments", createOrderComment);
protectedRouter.put("/comments/:id/status", updateOrderCommentStatus);

// =============== Admin Receiving Api's ================
protectedRouter.get('/receiving-listing', getReceivingListing);
protectedRouter.put('/receiving-status/items', statusOrderSupplierLineItems);
protectedRouter.post('/grn/create/:order_id', createOrderGRNDocument);
protectedRouter.get('/receiving-detail/:order_id', getReceivingDetail);
// protectedRouter.put('/order-receiving/:order-receiving-id', updateOrderStatus);



// ================ Admin Invoice Api's ==================
protectedRouter.get('/invoice-listing', getInvoiceListing);
protectedRouter.get('/invoice-detail/:order_id', getInvoiceDetail);
protectedRouter.post('/invoice-request/:order_receiving_id/:order_id', requestMultipleInvoiceSupplierItems);
protectedRouter.put("/:order_id/is3way", updateIs3Way);
// ================== update invoice link and payable amount/date
protectedRouter.put("/orders/:order_id/receiving", updateOrderReceiving);


//  ======================== vendor side Purchase Order =========================
protectedRouter.get('/getsupplierpo/:selected_supplier_id', getSupplierPOController);
protectedRouter.put('/:id/supplier-status', updateSupplierStatusController);
//  ======================= delivery status update ===============================
protectedRouter.put('/:quotation_id/supplier-items', updateSupplierItemsController);

//  ======================== vendor side Invoice =========================
protectedRouter.get('/getsupplierinvoices/:supplier_id', getAllInvoiceRequestedOrders);
protectedRouter.get('/getinvoice-detail/:invoice_id', getSupplierInvoiceById);
protectedRouter.put('/generate-invoice/:invoice_id', updateSupplierInvoiceStatus);
protectedRouter.put("/updateInvoiceLink/:order_id", updateInvoiceData);
protectedRouter.post("/send-notification",sendNotificationController);



// =============== Backoffice Api's ==================
protectedRouter.get('/purchase-order', getAllPOController);
protectedRouter.get("/orders/:organization_id", getOrganizationOrderController);

router.use(protectedRouter);
export default router;