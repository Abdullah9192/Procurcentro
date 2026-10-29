import { Router } from "express";
import notificationroutes from './notification-routes'
// import authRoutes from './auth-routes'
// // import getStartedRoutes from './get-started-routes';
const router = Router()

// router.use('/api/auth', authRoutes)
// // router.use('/organization', getStartedRoutes)
router.use('/notification' , notificationroutes)

export default router;

