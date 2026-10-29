import express from 'express';
import { fetchAllUsers, fetchUserById } from '../controllers/user/UserController';


const router = express.Router();


router.get('/users', fetchAllUsers);
router.get('/:id/user', fetchUserById);

export default router;
