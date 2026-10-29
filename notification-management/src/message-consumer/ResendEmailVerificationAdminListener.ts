import { generateResetEmailTemplate } from "../app/utils/emails/templates/ResetPasswordRequestUtils";
import { sendVerificationEmail } from "../app/utils/emails/templates/SendVerificationEmailUtils";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { consumeQueue } from "../rabbitmq/Consumer";
import { adminEvents } from "../rabbitmq/Events";
import { RBT_ADMIN_QUEUES } from "../rabbitmq/Queues";
interface AdminResendEmailVerificationMessage {
  event: string;
  data: {
   email: string;
   resetUrl: string;
   username: string;
  };
}
export const listenToAdminResendEmailVerificationMessageQueue = async () => {
  await consumeQueue(RBT_ADMIN_QUEUES.ADMIN_RESEND_EMAIL_VERIFICATION_QUEUE, async (message:AdminResendEmailVerificationMessage) => {
    const { event, data } = message;
    if (event !== adminEvents.resend_email_verfication) {
    console.warn("Skipping unknown event:", event);
    return;
    }
    const { email, resetUrl, username } = data;
    const html = sendVerificationEmail({
       resetUrl: resetUrl,
      username: username,
    });
    await sendEmail({
      to: email,
      subject: "Resend Email Verification",
      html,
    });
    console.log(message);
  });
};
