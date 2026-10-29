import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { addContractSignerFields, addContractSigners, convertDocToPdf, createContract, generateDoc, getAllContracts, getContractById, prepareAndSendBoldSignDocument, prepareBoldSignDraft, sendBoldSignDocument, sendDocumentBoldSign, updateContract } from "../controllers/ContractController";
import { boldSignWebhook, createOrderContract, downloadOrderContract, sendOrderContractBoldSign } from "../controllers/PurchaseOrderContract";

const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// Routes for the contract Management
protectedRouter.post("/create-contract", createContract);
protectedRouter.get("/contract/listing", getAllContracts);
protectedRouter.get("/contract/:id", getContractById);
protectedRouter.put("/contract/:id", updateContract);

protectedRouter.post("/signers/:contractId", addContractSigners);

protectedRouter.post("/signer-fields/:contractId", addContractSignerFields);

// Test bold sign 

protectedRouter.post("/contracts/:id/send/document/boldsign", sendDocumentBoldSign);

// prepareBoldSignDraft
protectedRouter.post("/contracts/:id/prepare-boldsign-draft", prepareBoldSignDraft);

// prepareAndSendBoldSignDocument
protectedRouter.post("/contracts/:id/prepare-draft-document", prepareAndSendBoldSignDocument);

// sendBoldSignDocument
protectedRouter.post("/contracts/:id/send-boldsign-document", sendBoldSignDocument);

// End Testing bold sign

protectedRouter.post("/generate-doc", generateDoc);

protectedRouter.post("/convert-doc-to-pdf/:contract_id", convertDocToPdf);

//PO BoldSign
protectedRouter.post("/order-contracts", createOrderContract);
protectedRouter.post("/order-contracts/:id/send/boldsign", sendOrderContractBoldSign);
router.post("/order-contracts/boldsign/webhook", boldSignWebhook);
protectedRouter.get("/order-contract/download/:purchaseOrderId",downloadOrderContract);

router.use(protectedRouter);
export default router;
