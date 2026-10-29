import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import User from "../app/models/User";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  MICROSOFT_CALLBACK_URL,
} from "./EnvVariables";
import { VerifyCallback } from "jsonwebtoken";
import { generateToken } from "../app/utils/general/JwtUtils";

interface MicrosoftUserResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  profile: any;
  token: string;
  userType: "admin" | "vendor" | "employee";
}

// Google Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  console.log("GOOGLE_CALLBACK_URL from env:", GOOGLE_CALLBACK_URL);
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
        passReqToCallback: true,
      },
      async (
        req: any,
        accessToken: string,
        _refreshToken: string, // underscore = ignore
        profile: GoogleProfile,
        done: any
      ) => {
        try {
          const allowedTypes = ["admin", "vendor", "employee"] as const;
          type UserType = (typeof allowedTypes)[number];

          let userType = req.query?.state as string;

          if (!allowedTypes.includes(userType as UserType)) {
            return done(null, false, { message: "Invalid user type" });
          }

          const typedUserType = userType as UserType;

          const email = profile.emails?.[0]?.value;
          if (!email) return (done as any)(null, false, { message: "No email found" });

          // Find or create user
          let user = await User.findOne({ where: { email } });
          if (!user) {
            // optional: create user if you want auto-registration
            user = await User.create({
              email,
              google_id: profile.id,
              name: profile.displayName,
              user_type: typedUserType,
              is_email_verified: true,
            });
          }
          // If user exists but no google_id yet → update it
          if (!user.google_id) {
            user.google_id = profile.id;
            await user.save();
          }
          const token = await generateToken({
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            organization_id: user.organization_id,
            org_role_id: user.org_role_id,
            user_role: user.org_role?.role_name,
            user_type: user.user_type,
          });
          // :white_check_mark: send everything you want to controller
          return done(null, { user, accessToken, refreshToken: _refreshToken, profile, token, userType: typedUserType });
        } catch (error) {
          return (done as any)(error);
        }
      }
    )
  );
} else {
  console.log("Skipping Google OAuth (missing env vars)");
}
// Microsoft Strategy
if (MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && MICROSOFT_CALLBACK_URL) {
  console.log("MICROSOFT_CALLBACK_URL from env:", MICROSOFT_CALLBACK_URL);
  passport.use(
    new MicrosoftStrategy(
      {
        tenant: "common",
        clientID: MICROSOFT_CLIENT_ID,
        clientSecret: MICROSOFT_CLIENT_SECRET,
        callbackURL: MICROSOFT_CALLBACK_URL,
        authorizationURL: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        scope: ["openid", "profile", "email", "offline_access", "user.read"],
        passReqToCallback: true,
      },
      async (
        req: any,
        accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (err: any, userObj?: MicrosoftUserResult, info?: any) => void
      ) => {
        try {
          const allowedTypes = ["admin", "vendor", "employee"] as const;
          type UserType = (typeof allowedTypes)[number];

          let userType = req.query?.state as string;

          if (!allowedTypes.includes(userType as UserType)) {
            return done(null, null as any, { message: "Invalid user type" });
          }

          const typedUserType = userType as UserType;

          const email =
            profile.emails?.[0]?.value ||
            profile._json?.mail ||
            profile._json?.userPrincipalName;

          if (!email)
            return (done as any)(null, false, { message: "No email found" });

          // Find or create user
          let user = await User.findOne({ where: { email } });
          if (!user) {
            user = await User.create({
              email,
              microsoft_id: profile.id,
              name: profile.displayName,
              user_type: typedUserType,
              is_email_verified: true,
            });
          } else {
            // ✅ PREVENT ROLE SWITCH
            if (user.user_type !== typedUserType) {
              return done(null, null as any, { message: "User type mismatch" });
            }
          }

          // Update microsoft_id if missing
          if (!user.microsoft_id) {
            user.microsoft_id = profile.id;
            await user.save();
          }

          // ✅ Generate JWT token
          const token = await generateToken({
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            organization_id: user.organization_id,
            org_role_id: user.org_role_id,
            user_role: user.org_role?.role_name,
            user_type: user.user_type,
          });

          console.log("MICROSOFT STRATEGY: Generated JWT token:", token);

          const result: MicrosoftUserResult = {
            user,
            accessToken,
            refreshToken: _refreshToken,
            profile,
            token,
            userType: typedUserType,
          };

          return done(null, result);

        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.log("Skipping Microsoft OAuth (missing env vars)");
}

// Serialize / Deserialize
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
export default passport;