import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { addSupplierQuotation, adminSupplierLineItem, createQuotation, createRequisitionQuotation, getAllQuotations, getAllQuotationsController, getOrganizationQuotationsController, getQuotationBiddingSummaryController, getQuotationById, getQuotations, getQuoteComparison, getSupplierQuotationById, getSupplierQuotationDetail, getSupplierQuotationsController, selectQuotationSupplier, submitSupplierQuotationController, supplierNegotiation, updateNegotiationStatus, updateQuotationStatus, updateQuotationStatusController, updateSupplierBidController } from "../controllers/QuotationController";
import { createQuotationScoring, deleteQuotationScoring, getQuotationScoringById, getQuotationScorings, updateQuotationScoring } from "../controllers/ScoringController";

const router = Router()
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// protectedRouter.get('/get-supplier-quotations/:supplier_id', getSupplierQuotations);
protectedRouter.post('/create-supplier-quotations', addSupplierQuotation);
// protectedRouter.get('/get-quotation/:id', getQuotationDetail); will not use this
// protectedRouter.get('/order-quotation/:supplier_id/:quotation_id', getQuotationOrderDetail);
// protectedRouter.get('/selected-supplier/:quotation_id/:supplier_id', selectedSupplierQuotation);
// protectedRouter.put('/status-quotation-line-item-supplier/:id', statusSupplierLineItem);
protectedRouter.post('/admin-quotation-line-item-supplier', adminSupplierLineItem);

//  New Api's
protectedRouter.post("/create", createQuotation);
protectedRouter.post('/create-requisition-quotation', createRequisitionQuotation);
protectedRouter.get("/get-quotation/:id", getQuotationById);
protectedRouter.put("/negotiation", supplierNegotiation);
protectedRouter.put("/update-negotiation/status/:quotation_negotiation_id", updateNegotiationStatus);
protectedRouter.put('/select-supplier/:quotation_id/:supplier_id', selectQuotationSupplier);
protectedRouter.get("/list-quotation", getQuotations);
protectedRouter.get("/get-quote-comparison/:quotationId", getQuoteComparison);
protectedRouter.put('/update-quotation-status/:id',updateQuotationStatus);
// selected_supplier_quotation:
// protectedRouter.get("/get-quote-comparison/:quotationId", getQuoteComparison);
protectedRouter.get("/quotation-data-list", getAllQuotations);

protectedRouter.get('/supplier-selected/quotation-detail/:id', getSupplierQuotationDetail);

//==========vendor API's ================
protectedRouter.get('/supplier/:supplier_id' , getSupplierQuotationsController);
protectedRouter.get('/quotations' , getAllQuotationsController);
protectedRouter.put('/supplier/submit/:quotationId/submit' , submitSupplierQuotationController);
protectedRouter.put('/supplier/bid/:quotationId/' , updateSupplierBidController);
protectedRouter.get('/:quotationId/bidding-summary/:supplierId' , getQuotationBiddingSummaryController);
protectedRouter.put('/:quotationId/status' , updateQuotationStatusController);
protectedRouter.get("/supplier-quotation-detail/:quotation_id/:supplier_id", getSupplierQuotationById);
// =============== Scoring Api's ================
protectedRouter.post("/scoring", createQuotationScoring);
protectedRouter.get("/scoring-listing", getQuotationScorings);
protectedRouter.get("/scoring-detail/:id", getQuotationScoringById);
protectedRouter.put("/update-scoring/:id", updateQuotationScoring);
protectedRouter.delete("/delete-scoring/:id", deleteQuotationScoring);

// ============ Back office Api's ==============
protectedRouter.get("/quotation-data-list", getAllQuotations);

// =============== Backoffice Api's ==================
router.get("/quotations/:organization_id", getOrganizationQuotationsController);

router.use(protectedRouter);
export default router;