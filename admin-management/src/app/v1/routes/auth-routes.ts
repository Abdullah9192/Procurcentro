import { Router } from "express";
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  logout,
  getMe,
  getUser,
  changePassword,
  getUserListing,
  googleLogin,
  microsoftLogin,
  getUserByEmail,
  updateUserById,
  createGoogleUser,
  setPassword
} from "../controllers/auth/AuthController";

import passport from "passport";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import {
  getVendorDetail,
  handleRegisterVendor,
  handleVendorLogin,
  updateVendorData,
  updateVendorStatus,
} from "../controllers/auth/VendorController";
import { handleEmployeeLogin, handleRegisterEmployee } from "../controllers/auth/EmployeeController";
import { generateToken } from "../../utils/general/JwtUtils";
import User from "../../models/User";
const router = Router();

// Login / Register / Logout
router.post("/register", register);
router.post("/login", login);
router.post("/googleuser", createGoogleUser);
router.post("/logout", logout);
router.post("/set-password", setPassword);

// Recovery Setup Flow
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verify-email", resendVerificationEmail);

router.get("/me", authMiddleware, getMe);
router.post("/change-password", authMiddleware, changePassword);

/**
 * ===========================
 *  MICROSOFT AUTH ROUTES
 * ===========================
 */

const redeemedCodes = new Set<string>();
router.get("/auth/microsoft", (req, res, next) => {
  const userType = req.query.user_type as string;
  passport.authenticate("microsoft" as any, {
    session: false,
    scope: ["user.read", "offline_access"],
    prompt: "select_account",
    state: userType, // now string
  })(req, res, next);
});

// router.get(
//   "/auth/microsoft/callback",
//   (req, res, next) => {
//     passport.authenticate("microsoft", { session: false }, async (err: any, userObj: any, info: any) => {
//       try {
//         console.log("MICROSOFT CALLBACK HIT:", new Date().toISOString());
//         if (err) return next(err);

//         if (!userObj) {
//           console.log("Microsoft Auth Failed:", info);
//           return res.redirect("/auth/failed");
//         }

//         console.log("USER OBJ RECEIVED IN CALLBACK:", userObj);
//         // const user = await User.findOne({ where: { id: userObj.id } });
//         const user = userObj.user;
//         if (!user) {
//           return;
//         }
//         const token = await generateToken({
//           id: user.id,
//           email: user.email,
//           is_active: user.is_active,
//           organization_id: user.organization_id,
//           org_role_id: user.org_role_id,
//           user_role: user.org_role?.role_name,
//           user_type: user.user_type,
//         });

//         let redirectUrl = process.env.FRONTEND_URL || "";

//         if (user.user_type === "admin") {
//           redirectUrl = `${process.env.ADMIN_FRONTEND_URL}/dashboard` || redirectUrl;
//         } else if (user.user_type === "vendor") {
//           redirectUrl = `${process.env.VENDOR_FRONTEND_URL}/vendor/dashboard` || redirectUrl;
//         } else if (user.user_type === "employee") {
//           redirectUrl = process.env.EMPLOYEE_FRONTEND_URL || redirectUrl;
//         }

//         console.log("REDIRECT URL:", redirectUrl);
//         console.log("FINAL REDIRECT:", `${redirectUrl}/?token=${token}`);
//         return res.redirect(`${redirectUrl}/?token=${token}`);

//       } catch (error) {
//         return next(error);
//       }
//     })(req, res, next);
//   }
// );

router.get(
  "/auth/microsoft/callback",
  (req, res, next) => {
    const code = req.query.code as string;

    if (!code) return res.redirect("/auth/failed");

    if (redeemedCodes.has(code)) {
      console.warn("Duplicate OAuth code detected, dropping request.");
      return res.status(400).json({ message: "Authorization code already used." });
    }

    redeemedCodes.add(code);
    setTimeout(() => redeemedCodes.delete(code), 5 * 60 * 1000);

    passport.authenticate("microsoft", { session: false }, async (err: any, userObj: any) => {
      try {
        console.log("ERR:", err);
        console.log("USEROBJ:", JSON.stringify(userObj, null, 2));

        if (err) return next(err);
        if (!userObj) return res.redirect("/auth/failed");

        // ✅ Handle both shapes: { user, token } OR flat user object
        const user = userObj.user ?? userObj;
        const existingToken = userObj.token;

        console.log("USER:", user?.email, "USER TYPE:", user?.user_type);

        if (!user?.user_type) return res.redirect("/auth/failed");

        // ✅ Generate token here if strategy didn't provide one
        const token = existingToken ?? await generateToken({
          id: user.id,
          email: user.email,
          is_active: user.is_active,
          organization_id: user.organization_id,
          org_role_id: user.org_role_id,
          user_role: user.org_role?.role_name,
          user_type: user.user_type,
        });

        console.log("TOKEN:", token);

        if (!token) return res.redirect("/auth/failed");

        const urls: Record<string, string> = {
          admin: `${process.env.ADMIN_FRONTEND_URL}/admin/dashboard`,
          vendor: `${process.env.VENDOR_FRONTEND_URL}/vendor/dashboard`,
          employee: process.env.EMPLOYEE_FRONTEND_URL!,
        };

        const redirectUrl = urls[user.user_type] || process.env.FRONTEND_URL!;

        console.log("REDIRECTING TO:", `${redirectUrl}?token=${token}`);

        return res.redirect(`${redirectUrl}/?token=${token}`);
      } catch (error) {
        console.error("Callback error:", error);
        return next(error);
      }
    })(req, res, next);
  }
);

/**
 * ===========================
 *  GOOGLE AUTH ROUTES
 * ===========================
 */

router.get("/auth/google", (req, res, next) => {
  const userType = req.query.user_type as string;

  console.log("test user type", userType);
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
    prompt: "select_account",
    state: userType,
  })(req, res, next);
});


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

// Vendor Auth Routes
router.post("/vendor-register", handleRegisterVendor);
router.post("/vendor-login", handleVendorLogin);
router.get("/get-vendor-detail", authMiddleware, getVendorDetail);
router.put("/update-vendor-status", authMiddleware, updateVendorStatus);
router.put("/update-vendor-data/:vendor_id", authMiddleware, updateVendorData);

// Employee Auth Routes
router.post("/employee-register", handleRegisterEmployee);
router.post("/employee-login", handleEmployeeLogin);

// Get Users Listingl
router.get("/get-users-listing", authMiddleware, getUserListing);
router.get("/get-user/:user_id", getUser);
router.get("/get-user-email/:email", getUserByEmail);
router.put("/update-user/:userId", updateUserById);
export default router;
