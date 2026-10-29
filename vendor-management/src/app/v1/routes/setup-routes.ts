import { Router } from "express";
import { multipartParser } from "../../middlewares/MultiParserMiddleware";
import { createSupplierSetupData, getDocumentList, getIndusteryList, getSupplierBankInfo, getSupplierBasicInfo, getSupplierClientReferenceInfo, getSupplierContactInfo, getSupplierContactInfoBysupplierId, getSupplierKYCInfo, updateSupplierBankInfo, updateSupplierBasicInfo, updateSupplierClientReference, updateSupplierContact, updateSupplierKycInfo, uploadAzureFile, verifyVendorSupplier } from "../controllers/setup/SetupController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";

const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

router.post(
    "/upload-file",
    multipartParser,
    uploadAzureFile
);

protectedRouter.post("/create-supplier", createSupplierSetupData);

// Basic Information 
protectedRouter.put("/update-basic-info/:supplier_id", updateSupplierBasicInfo);
protectedRouter.get("/get-basic-info", getSupplierBasicInfo);

// Bank Information
protectedRouter.put("/update-bank-info", updateSupplierBankInfo);
protectedRouter.get("/get-bank-info", getSupplierBankInfo);

// KYC Info
protectedRouter.put("/update-kyc-info/:supplier_kyc_id", updateSupplierKycInfo);
protectedRouter.get("/get-kyc-info", getSupplierKYCInfo);

// contact info
protectedRouter.put("/update-contact-info", updateSupplierContact);
protectedRouter.get("/get-contact-info", getSupplierContactInfo);
protectedRouter.get("/get-supplier-contact-info/:user_id", getSupplierContactInfoBysupplierId);


// Client References
protectedRouter.put("/update-client-ref", updateSupplierClientReference);
protectedRouter.get("/get-client-reference", getSupplierClientReferenceInfo);

// Document List
protectedRouter.get("/get-supplier-document-list/:organization_id/:user_id", getDocumentList);
protectedRouter.put("/verify-supplier-document/:organization_id/:user_id", verifyVendorSupplier);

//get Supplier Industrial Category List
protectedRouter.get("/get-supplier-categories", getIndusteryList);

router.use(protectedRouter);
export default router;