import { generateResetEmailTemplate } from "../app/utils/emails/templates/ResetPasswordRequestUtils";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { consumeQueue } from "../rabbitmq/Consumer";
import { adminEvents } from "../rabbitmq/Events";
import { RBT_ADMIN_QUEUES } from "../rabbitmq/Queues";
interface AdminResetEmailMessage {
  event: string;
  data: {
   email: string;
   resetUrl: string;
   username: string;
  };
}
export const listenToAdminResetEmailQueue = async () => {
  await consumeQueue(RBT_ADMIN_QUEUES.ADMIN_RESET_EMAIL_QUEUE, async (message:AdminResetEmailMessage) => {
    const { event, data } = message;
    if (event !== adminEvents.reset_admin_email) {
    console.warn("Skipping unknown event:", event);
    return;
    }
    const { email, resetUrl, username } = data;
    const html = generateResetEmailTemplate({
       resetUrl: resetUrl,
      username: username,
    });
    await sendEmail({
      to: email,
      subject: "Recovery Reset Email Verification",
      html,
    });
    console.log(message);
  });
};
