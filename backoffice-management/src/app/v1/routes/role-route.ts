import { Router } from "express";
import {
  addRole,
  editRole,
  removeRole,
  getRole,
  getRoles,
  assignRoleController,
  getAllPermissionsController,
} from "../controllers/role/RoleController";
import { authMiddleware } from "../../middlewares/AuthMiddleware"; // your existing token validation middleware

const router = Router();


router.post("/create", authMiddleware, addRole);
router.get("/", authMiddleware, getRoles);
router.get('/permissions',authMiddleware, getAllPermissionsController);
router.get("/:id", authMiddleware, getRole);
router.put("/:id", authMiddleware, editRole);
router.delete("/:id", authMiddleware, removeRole);
router.put('/assign-role/permission',authMiddleware, assignRoleController);


export default router;
