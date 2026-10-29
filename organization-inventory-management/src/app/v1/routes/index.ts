import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { addBulkProducts, addProduct, deactivateProduct, deleteProduct, getOrgCategories, getProduct, getProducts, serviceItemInventoryBulkUpload, updateInventoryLocation, updateProduct } from "../controllers/ProductController";
import { multipartParser } from "../../middlewares/MultiParserMiddleware";
const router = Router();
const upload = multer({ dest: "uploads/" });

// ✅ Sub-router for authenticated routes
const protectedRouter = Router();
protectedRouter.use(authMiddleware);

protectedRouter.post("/product", multipartParser, addProduct);
protectedRouter.post("/import-items-services",upload.single("file"), serviceItemInventoryBulkUpload);
protectedRouter.get("/products", getProducts);
protectedRouter.get("/product/:id", getProduct);
protectedRouter.put("/update-product/:id", updateProduct);
protectedRouter.delete("/delete-product/:id", deleteProduct);
protectedRouter.put("/deactivate-product/:id", deactivateProduct);
protectedRouter.post("/product-bulkupload", addBulkProducts);
protectedRouter.put("/product/location", updateInventoryLocation);
protectedRouter.get("/categories-listing", getOrgCategories);

router.use(protectedRouter);
export default router;