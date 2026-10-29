import { consumeQueue } from "../rabbitmq/Consumer";
import { adminEvents } from "../rabbitmq/Events";
import { RBT_ADMIN_QUEUES } from "../rabbitmq/Queues";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { sendInviteAdminEmailTemplate } from "../app/utils/emails/templates/InviteAdminUtils";

interface AdminInviteMessage {
  event: string;
  data: {
    email: string;
    username: string;
    inviteUrl: string;
  };
}

export const listenToAdminInviteEmailQueue = async () => {
  await consumeQueue(
    RBT_ADMIN_QUEUES.INVITE_ADMIN_QUEUE,
    async (message: AdminInviteMessage) => {
      console.log("admin invite message", message);

      const { event, data } = message;

      if (event !== adminEvents.invite_admin_email) {
        console.warn("Skipping unknown event:", event);
        return;
      }

      const { email, username, inviteUrl} = data;

      // ✅ use template (same pattern as verification)
      const html = sendInviteAdminEmailTemplate({
        username,
        inviteUrl
      });

      await sendEmail({
        to: email,
        subject: "Admin Invitation",
        html,
      });

      console.log("Invite email sent:", message);
    }
  );
};
