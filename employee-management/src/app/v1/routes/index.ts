import { Router } from "express";
import authRoutes from './auth-routes';
import employeeRoute from './employee-routes'
const router = Router()

router.use('/auth', authRoutes)
router.use('/employee' ,employeeRoute);


export default router;