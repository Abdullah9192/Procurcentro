import { Router } from "express";
import settingRoutes from "./setting";  
import managementRoutes from "./management";  


const router = Router();

router.use("/setting", settingRoutes);
router.use("/management", managementRoutes);
export default router;
