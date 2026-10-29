import { Router } from "express";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { createExternalRequisition, createInternalRequisition, getExternalItemRequisition, getInternalItemRequisition, getRequisitions, updateExternalItemRequisition, updateInternalItemRequisition, updateRequisitionStatus } from "../controllers/RequisitionController";
import { createExternalServiceRequisition, createInternalServiceRequisition, deleteExternalServiceRequisition, getExternalServiceRequisition, getExternalServiceRequisitionList, getInternalServiceRequisition, updateExternalServiceRequisition, updateInternalServiceRequisition } from "../controllers/RequisitionServiceController";
const router = Router();

const protectedRouter = Router();
protectedRouter.use(authMiddleware);

//===========item==========//
// Add Requisition
protectedRouter.post("/internal-requisition/item", createInternalRequisition);
protectedRouter.post('/external-requisition/item', createExternalRequisition);
// get internal item Detail
protectedRouter.get("/get-internal-requisition/item/:id", getInternalItemRequisition);
// get external item Detail
protectedRouter.get("/get-external-requisition/item/:id", getExternalItemRequisition);
// get external item Detail
protectedRouter.put("/update-internal-requisition/item/:id", updateInternalItemRequisition);
// get external item Detail
protectedRouter.put("/update-external-requisition/item/:id", updateExternalItemRequisition);

// generic api's
protectedRouter.delete("/delete-requisition/:id", deleteExternalServiceRequisition);
protectedRouter.put("/requisition-status/:id", updateRequisitionStatus);

// ============= Service=============//
// Add External Service Requisition
protectedRouter.post("/external-requisition/service", createExternalServiceRequisition);
// Get External Service Requisition Detail
protectedRouter.get("/get-external-requisition/service/:id", getExternalServiceRequisition);
// Update External Service Requisition
protectedRouter.put("/update-external-requisition/service/:id", updateExternalServiceRequisition);

// Add Internal Service Requisition
protectedRouter.post("/internal-requisition/service", createInternalServiceRequisition);
// Get Internal Service Requisition Detail
protectedRouter.get("/get-internal-requisition/service/:id", getInternalServiceRequisition);
// Update External Service Requisition
protectedRouter.put("/update-internal-requisition/service/:id", updateInternalServiceRequisition);

// =================backoffice ================
protectedRouter.get("/get-requisitions", getRequisitions);

router.use(protectedRouter);

export default router;
