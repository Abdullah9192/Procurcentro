import { generateInviteEmployeeEmailTemplate } from "../app/utils/emails/templates/InviteUserEmailUtils";
import { sendEmail } from "../app/utils/general/MailerUtils";
import { EMPLOYEE_FRONTEND_URL } from "../config/EnvVariables";
import { consumeQueue } from "../rabbitmq/Consumer";
import { employeeEvents } from "../rabbitmq/Events";
import { RBT_EMPLOYEE_QUEUES } from "../rabbitmq/Queues";

interface EmployeeEmailPayload {
  email: string;
  user_name: string;
}

interface EmployeeInviteMessage {
  event: string;
  data: EmployeeEmailPayload[];
}

export const listenToEmployeeRegisterEmailQueue = async () => {
  await consumeQueue(
    RBT_EMPLOYEE_QUEUES.EMPLOYEE_REGISTER_QUEUE,
    async (message: EmployeeInviteMessage) => {
      try {
        const { event, data } = message;
        console.log("Listening to employee register email queue...", data);

        if (event !== employeeEvents.send_employee_email) {
          console.warn("Skipping unknown event:", event);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Invalid employee email data format");
          return;
        }

        await Promise.all(
          data.map(({ email, user_name }) => {
            const html = generateInviteEmployeeEmailTemplate({
              signUpUrl: `${EMPLOYEE_FRONTEND_URL}/signup`,
              username: user_name,
            });

            return sendEmail({
              to: email,
              subject: "Welcome to the Employee Portal - Account Created",
              html,
            });
          })
        );
      } catch (error) {
        console.error("Error processing employee invite email queue:", error);
      }
    }
  );
};
