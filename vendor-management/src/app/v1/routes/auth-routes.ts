import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  getVendorDetail,
  googleLogin,

} from "../controllers/auth/AuthController";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
const router = Router();

router.put("/register", register);
router.post("/login", login);
router.get('/supplier-detail', authMiddleware, getVendorDetail);

/**
 * ===========================
 *  GOOGLE AUTH ROUTES
 * ===========================
 */
router.get(
  "/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failed",
  }),
  googleLogin
);

/**
 * ===========================
 *  AUTH FAILED
 * ===========================
 */
router.get("/auth/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Authentication failed",
  });
});

export default router;
