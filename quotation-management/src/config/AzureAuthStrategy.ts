// import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
// import passport from 'passport';
// import UserSupplier from '../app/models/UserSupplier';
// import { 
//   AZURE_CLIENT_ID, 
//   AZURE_CLIENT_SECRET, 
//   AZURE_REDIRECT_URI, 
//   AZURE_TENANT_ID 
// } from './EnvVariables';


// // Helper function to ensure required env vars exist
// function getRequiredEnvVar(name: string, value?: string): string {
//   if (!value) {
//     throw new Error(`Missing required environment variable: ${name}`);
//   }
//   return value;
// }

// export const initializeMicrosoftStrategy = () => {
//   // Get validated environment variables
//   const clientID = getRequiredEnvVar('AZURE_CLIENT_ID', AZURE_CLIENT_ID);
//   const clientSecret = getRequiredEnvVar('AZURE_CLIENT_SECRET', AZURE_CLIENT_SECRET);
//   const callbackURL = getRequiredEnvVar('AZURE_REDIRECT_URI', AZURE_REDIRECT_URI);
//   const tenant = getRequiredEnvVar('AZURE_TENANT_ID', AZURE_TENANT_ID);

//   const strategy = new MicrosoftStrategy(
//     {
//       clientID,
//       clientSecret,
//       callbackURL,
//       tenant,
//       scope: ['user.read'],
//       authorizationURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
//       tokenURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
//     },
//     async (accessToken: string, refreshToken: string, profile: any, done: any) => {
//       try {
//         const email = profile.emails?.[0]?.value;
//         if (!email) {
//           return done(null, false, { message: 'Email not found in profile' });
//         }

//         // Find or create user
//         let user = await UserSupplier.findOne({ 
//           where: { email } 
//         });

//         if (!user) {
//           return done(null, false, { 
//             message: 'No user found with this email',
//             reason: 'USER_NOT_FOUND' 
//           });
//         }

//         // Update user with Microsoft ID if needed
//         if (!user.microsoft_id) {
//           user.microsoft_id = profile.id;
//           user.is_email_verified = true;
//           await user.save();
//         }

//         return done(null, user);
//       } catch (error) {
//         console.error('Microsoft authentication error:', error);
//         return done(error);
//       }
//     }
//   );

//   passport.use('microsoft', strategy);
//   console.log('Microsoft strategy initialized successfully');
//   return strategy;
// };