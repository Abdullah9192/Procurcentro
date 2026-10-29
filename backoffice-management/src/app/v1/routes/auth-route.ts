import { Router } from "express";
import { forgotPassword, googleLogin, inviteUser, login, microsoftLogin } from "../controllers/auth/AuthController";
import { authMiddleware } from "../../middlewares/AuthMiddleware"; // your existing token validation middleware
import passport from "passport";


const router = Router();


router.post("/login", login);
router.post("/invite-user", inviteUser);
router.post("/forget-password", forgotPassword);


/**
 * ===========================
 *  MICROSOFT AUTH ROUTES
 * ===========================
 */
router.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {
    session: false,
    scope: ["user.read", "offline_access"],
    prompt: "select_account", // Optional: force account selection
  })
);

router.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", {
    session: false,
    failureRedirect: "/auth/failed",
  }),
 microsoftLogin
);


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
