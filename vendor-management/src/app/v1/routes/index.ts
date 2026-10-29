import { Router } from "express";
import authRoutes from './auth-routes';
import setupRoutes from './setup-routes';
import catalogueRoutes from './catalogue-routes';
import creditRoutes from './credit-routes';
import ratingRoutes from './rating-routes';

const router = Router()

router.use('/auth', authRoutes)
router.use('/setup', setupRoutes);
router.use('/catalogue', catalogueRoutes);
router.use('/credit', creditRoutes);
router.use('/rating', ratingRoutes);

export default router