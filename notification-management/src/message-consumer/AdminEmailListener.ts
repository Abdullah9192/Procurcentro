import { sendVerificationEmail } from "../app/utils/emails/templates/SendVerificationEmailUtils";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { ADMIN_FRONTEND_URL } from "../config/EnvVariables";
import { consumeQueue } from "../rabbitmq/Consumer";
import { adminEvents } from "../rabbitmq/Events";
import { RBT_ADMIN_QUEUES } from "../rabbitmq/Queues";
interface AdminInviteMessage {
  event: string;
  data: {
   email: string;
   token: string;
   username: string;
  };
}
export const listenToAdminRegisterEmailQueue = async () => {
  await consumeQueue(RBT_ADMIN_QUEUES.ADMIN_REGISTER_QUEUE, async (message:AdminInviteMessage) => {
    console.log("admin listener" , message)
    const { event, data } = message;
    if (event !== adminEvents.verify_admin_email) {
    console.warn("Skipping unknown event:", event);
    return;
    }
    const { email, token, username } = data;
    const html = sendVerificationEmail({
      resetUrl: `${ADMIN_FRONTEND_URL}/email-verification?token=${token}`,
      username: username,
    });
    await sendEmail({
      to: email,
      subject: "Email Verification",
      html,
    });
    console.log(message);
  });
};
