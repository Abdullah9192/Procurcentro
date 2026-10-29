import nodemailer from "nodemailer";
import { smtp } from "../../../config/EnvVariables";

const transporter = nodemailer.createTransport({
  host: smtp.SMTP_HOST,
  port: Number(smtp.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: smtp.SMTP_USER,
    pass: smtp.SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
  from = smtp.SMTP_FROM || smtp.SMTP_USER,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) => {
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};
