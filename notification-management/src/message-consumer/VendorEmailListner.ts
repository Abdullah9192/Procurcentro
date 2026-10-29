import { generateInviteVendorEmailTemplate } from "../app/utils/emails/templates/InviteVenderEmailUtils";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { VENDOR_FRONTEND_URL } from "../config/EnvVariables";
import { consumeQueue } from "../rabbitmq/Consumer";
import { vendorEvents } from "../rabbitmq/Events";
import { RBT_VENDOR_QUEUES } from "../rabbitmq/Queues";

interface VendorEmailPayload {
  email: string;
  user_name: string;
  organization_name: string;
}

interface VendorInviteMessage {
  event: string;
  data: VendorEmailPayload[];
}

export const listenToVendorRegisterEmailQueue = async () => {
  await consumeQueue(
    RBT_VENDOR_QUEUES.VENDOR_REGISTER_QUEUE,
    async (message: VendorInviteMessage) => {
      try {
        const { event, data } = message;
        console.log("Listening to vendor register email queue...", data);

        if (event !== vendorEvents.send_vendor_email) {
          console.warn("Skipping unknown event:", event);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Invalid vendor email data format");
          return;
        }

        await Promise.all(
          data.map(({ email, user_name, organization_name }) => {
            const html = generateInviteVendorEmailTemplate({
              signUpUrl: `${VENDOR_FRONTEND_URL}/signup`,
              username: user_name,
              organizationName: organization_name,
            });

            return sendEmail({
              to: email,
              subject: "Welcome to the Supplier Portal - Account Created",
              html,
            });
          })
        );
      } catch (error) {
        console.error("Error processing vendor invite email queue:", error);
      }
    }
  );
};
