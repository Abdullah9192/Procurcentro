import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
// import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    // MICROSOFT_CLIENT_ID,
    // MICROSOFT_CLIENT_SECRET,
    // MICROSOFT_CALLBACK_URL,
} from "./EnvVariables";
import { executeGetUserByEmailApi , executeUpdateUserGoogleId } from "../app/respository/auth/AuthRepository"; 
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
    async (
      accessToken: string,
      _refreshToken: string,
      profile: GoogleProfile,
      done: (err: any, user?: any, info?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email)
          return done(null, false, { message: "No email found from Google" });

        // ✅ Step 1: Get user by email (API)
        const result = await executeGetUserByEmailApi(email);

        if (!result.success || !result.data) {
          return done(null, false, {
            message: "Sorry, you don’t already exist in any organization.",
          });
        }

        let user = result.data;

        // ✅ Step 2: Update google_id if not set
        if (!user.google_id) {
          const updateRes = await executeUpdateUserGoogleId(user.id, profile.id);
          if (updateRes.success && updateRes.data) {
            user = updateRes.data;
          }
        }

        // ✅ Step 3: Generate backend JWT
        const token = await generateToken({
          id: user.id,
          email: user.email,
          is_active: user.is_active,
          organization_id: user.organization_id,
          org_role_id: user.org_role_id,
          user_role: user.org_role?.role_name,
          user_type: user.user_type,
        });

        return done(null, {
          user,
          accessToken,
          refreshToken: _refreshToken,
          profile,
          token,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);
} else {
    console.log("Skipping Google OAuth (missing env vars)");
}


// Microsoft Strategy
// if (MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && MICROSOFT_CALLBACK_URL) {
//     passport.use(
//         new MicrosoftStrategy(
//             {
//                 tenant: "common",
//                 clientID: MICROSOFT_CLIENT_ID,
//                 clientSecret: MICROSOFT_CLIENT_SECRET,
//                 callbackURL: MICROSOFT_CALLBACK_URL,
//                 authorizationURL:
//                     "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
//                 tokenURL:
//                     "https://login.microsoftonline.com/common/oauth2/v2.0/token",
//                 scope: ["user.read", "offline_access"],
//                 // prompt: "login",
//             },
//             async (accessToken: string,
//                 _refreshToken: string, // underscore = ignore
//                 profile: GoogleProfile,
//                 done: (err: any, user?: any, info?: any) => void) => {
//                 try {
//                     const email = profile.emails?.[0]?.value;
//                     if (!email) return (done as any)(null, false, { message: "No email found" });

//                     let user = await User.findOne({ where: { email } });
//                     if (!user) {
//                         // optional auto-registration
//                         user = await User.create({
//                             email,
//                             microsoft_id: profile.id,
//                             name: profile.displayName,
//                             is_email_verified: true,
//                         });
//                     }

//                     if (!user.microsoft_id) {
//                         user.microsoft_id = profile.id;
//                         await user.save();
//                     }

//                     return done(null, { user, accessToken, refreshToken: _refreshToken, profile });
//                 } catch (error) {
//                     return (done as any)(error);
//                 }
//             }
//         )
//     );
// } else {
//     console.log("Skipping Microsoft OAuth (missing env vars)");
// }

// // Serialize / Deserialize
// passport.serializeUser((user: any, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id: number, done) => {
//     try {
//         const user = await User.findByPk(id);
//         done(null, user);
//     } catch (err) {
//         done(err);
//     }
// });

export default passport;