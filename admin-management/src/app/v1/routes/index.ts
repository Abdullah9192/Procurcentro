import { Router } from "express";
import authRoutes from "./auth-routes";
import setupRoute from "./setup-routes";
import backOfficeRoute from "./backoffice-route";
import subscriptionRoute from "./subscription-routes";
import employeeRoute from "./employee-routes";
import admindashboard from "./admin-routes";
import evaluation from "./vendor-routes"
import { deleteAzureFile, deleteMultipleAzureFiles, uploadAzureFile, uploadMultipleAzureFiles } from "../../services/AzureFileUploadService";
import { multipartParser } from "../../middlewares/MultiParserMiddleware";
// import getStartedRoutes from './get-started-routes';
const router = Router();

router.use("/auth", authRoutes);
router.use('/organization', setupRoute);
router.use('/backoffice', backOfficeRoute);
router.use('/subscription', subscriptionRoute);
router.use('/employee', employeeRoute);
router.use('/dashboard', admindashboard );
router.use('/vendor', evaluation );

router.delete("/azure-file", deleteAzureFile);
router.post("/azure-file",multipartParser,uploadAzureFile);
router.post("/azure-files", multipartParser, uploadMultipleAzureFiles);
router.delete("/azure-files", deleteMultipleAzureFiles);

export default router;
