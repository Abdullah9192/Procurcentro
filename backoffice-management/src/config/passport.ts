import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import BackofficeUser from "../app/models/backoffice-user.entity";
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
            },
            async (accessToken: string,
                _refreshToken: string, // underscore = ignore
                profile: GoogleProfile,
                done: (err: any, user?: any, info?: any) => void
            ) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) return (done as any)(null, false, { message: "No email found" });
                    
                    // Find or create user
                    let user = await BackofficeUser.findOne({ where: { email } });
                    if (!user) {
                        // optional: create user if you want auto-registration
                        user = await BackofficeUser.create({
                            email,
                            google_id: profile.id,
                            full_name: profile.displayName,
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
                      });
                    // :white_check_mark: send everything you want to controller
                    return done(null, { user, accessToken, refreshToken: _refreshToken, profile  , token});
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
        scope: ["user.read", "offline_access"],
      },
      async (
        accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (err: any, user?: any, info?: any) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email)
            return (done as any)(null, false, { message: "No email found" });

          // Find or create user
          let user = await BackofficeUser.findOne({ where: { email } });
          if (!user) {
            user = await BackofficeUser.create({
              email,
              microsoft_id: profile.id,
              full_name: profile.displayName,
            });
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
          });

          // Return everything to controller
          return done(null, {
            user,
            accessToken,
            refreshToken: _refreshToken,
            profile,
            token,
          });
        } catch (error) {
          return (done as any)(error);
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
        const user = await BackofficeUser.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
// Serialize / Deserialize
// passport.serializeUser((user: any, done) => {
//     done(null, user.id);
// });
// passport.deserializeUser(async (id: number, done) => {
//     try {
//         const user = await BackofficeUser.findByPk(id);
//         done(null, user);
//     } catch (err) {
//         done(err);
//     }
// });
export default passport;