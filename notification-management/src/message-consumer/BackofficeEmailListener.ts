// import { sendVerificationEmail } from "../app/utils/emails/templates/SendVerificationEmailUtils";
// import { sendEmail } from "../app/utils/general/MailerUtils";
// import { BACKOFFICE_FRONTEND_URL } from "../config/EnvVariables";
// import { consumeQueue } from "../rabbitmq/Consumer";
// import { backOfficeEvents } from "../rabbitmq/Events";
// import { RBT_BACKOFFICE_QUEUES } from "../rabbitmq/Queues";
// interface AdminInviteMessage {
//   event: string;
//   data: {
//    email: string;
//    token: string;
//    username: string;
//   };
// }
// export const listenToAdminRegisterEmailQueue = async () => {
//   await consumeQueue(RBT_BACKOFFICE_QUEUES.BACKOFFICE_REGISTER_QUEUES, async (message:AdminInviteMessage) => {
//     const { event, data } = message;
//     if (event !== backOfficeEvents.verify_backoffice_email) {
//     console.warn("Skipping unknown event:", event);
//     return;
//     }
//     const { email, token, username } = data;
//     const html = sendVerificationEmail({
//       resetUrl: `${BACKOFFICE_FRONTEND_URL}/email-verification?token=${token}`,
//       username: username,
//     });
//     await sendEmail({
//       to: email,
//       subject: "Email Verification",
//       html,
//     });
//     console.log(message);
//   });
// };


import { generateInviteBackOfficeUserEmailTemplate } from "../app/utils/emails/templates/InviteBackOfficeUserEmailUtils";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { BACKOFFICE_FRONTEND_URL } from "../config/EnvVariables";
import { consumeQueue } from "../rabbitmq/Consumer";
import { backOfficeEvents } from "../rabbitmq/Events";
import { RBT_BACKOFFICE_QUEUES } from "../rabbitmq/Queues";

interface BackofficePayload {
  email: string;
  user_id: string;
}

interface BackOfficeUserInviteMessage {
  event: string;
  data: BackofficePayload;
}

export const listenToBackOfficeUserInviteEmailQueue = async () => {
  await consumeQueue(
    RBT_BACKOFFICE_QUEUES.BACKOFFICE_INVITE_QUEUE,
    async (message: BackOfficeUserInviteMessage) => {
      try {
        const { event, data } = message;
        console.log("Listening to backoffice user register email queue...", data);

        if (event !== backOfficeEvents.backoffice_invite_users) {
          console.warn("Skipping unknown event:", event);
          return;
        }
            const html = generateInviteBackOfficeUserEmailTemplate({
              signUpUrl: `${BACKOFFICE_FRONTEND_URL}/register`,
              username: data.email,
            });

            return sendEmail({
              to: data.email,
              subject: "Welcome to the Backoffice Portal - Account Created",
              html,
            });
         
      } catch (error) {
        console.error("Error processing user backoffice invite email queue:", error);
      }
    }
  );
};
