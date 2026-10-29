import { Router } from "express";
import roleRoute from "./role-route";
import authRoute from "./auth-route";
import userRoute from "./user-route";
import creditRoute from "./credit-value";
import notificationRoute from "./notification-route";


const router = Router();


router.use('/role', roleRoute);
router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/credits', creditRoute);
router.use('/notifications', notificationRoute);


export default router;
