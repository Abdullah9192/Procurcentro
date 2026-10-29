import { Router } from "express";
import { addClauseLibrary, deleteClauseLibrary, getAllClauseLibraries, getClauseLibraryById, updateClauseLibrary } from "../controllers/ClauseController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { addContractType, deleteContractType, getAllContractTypes, getContractTypeById, updateContractType } from "../controllers/ContractTypeController";

const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

// Routes for Clause Library
protectedRouter.post("/library/add", addClauseLibrary);
protectedRouter.get("/library/listing", getAllClauseLibraries);
protectedRouter.get("/library/:id", getClauseLibraryById);
protectedRouter.put("/library/:id", updateClauseLibrary);
protectedRouter.delete("/library/:id", deleteClauseLibrary);

// Routes for Contract Types
protectedRouter.post("/types/add", addContractType);
protectedRouter.get("/types/listing", getAllContractTypes);
protectedRouter.get("/types/:id", getContractTypeById);
protectedRouter.put("/types/:id", updateContractType);
protectedRouter.delete("/types/:id", deleteContractType);

router.use(protectedRouter);
export default router;
