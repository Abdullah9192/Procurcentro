import sgMail, { MailDataRequired } from "@sendgrid/mail";
import { smtp } from "../../../config/EnvVariables";

sgMail.setApiKey(smtp.SENDGRID_API_KEY || "");

export const sendEmail = async ({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) => {
  const msg: MailDataRequired = {
    to,
    from: from || smtp.SENDGRID_FROM || "",
    subject,
    html,
  };

   try {
    const res = await sgMail.send(msg);
    console.log("✅ Email sent:", res[0].statusCode);
  } catch (err: any) {
    console.error("❌ SendGrid error:", err.response?.body || err.message);
  }
};
