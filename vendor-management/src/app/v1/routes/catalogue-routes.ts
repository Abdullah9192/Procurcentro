import { Router } from "express";
import multer from "multer";
import { bulkUploadCatalogue, createCatalogue, deleteCatalogue, getAllCatalogues, getCatalogueById, updateCatalogue, updateSupplierCatalogueLocations } from "../controllers/catalogue/CatalogueController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
const router = Router();
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

const upload = multer({ dest: "uploads/" });

//add catalogue
protectedRouter.post("/add-supplier-catalogue", createCatalogue);
protectedRouter.post(
    "/bulk-upload-supplier-catalogue",
    upload.single("file"),
    bulkUploadCatalogue
);
protectedRouter.put(
  "/supplier-catalogue/:id/locations",
  updateSupplierCatalogueLocations
);
// update catalogue
protectedRouter.put("/update-supplier-catalogue/:supplier_catalogue_id", updateCatalogue);
// get by id
protectedRouter.get("/get-supplier-catalogue-detail/:supplier_catalogue_id", getCatalogueById);
// get all catalogue list
protectedRouter.get("/get-supplier-catalogues", getAllCatalogues);
// delete catalogue by id
protectedRouter.delete("/delete-supplier-catalogue/:supplier_catalogue_id", deleteCatalogue);

router.use(protectedRouter);

export default router;
