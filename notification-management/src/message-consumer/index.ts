import { listenToAdminRegisterEmailQueue } from "./AdminEmailListener";
import { listenToAdminResetEmailQueue } from "./AdminResetEmailListener";
import { listenToBackOfficeUserInviteEmailQueue } from "./BackofficeEmailListener";
import { listenToEmployeeRegisterEmailQueue } from "./EmployeeEmailListener";
import { listenToAdminInviteEmailQueue } from "./listenToAdminInviteEmailQueue";
import { listenToAdminResendEmailVerificationMessageQueue } from "./ResendEmailVerificationAdminListener";
import { listenToVendorRegisterEmailQueue } from "./VendorEmailListner";

export const main=async()=>{
  await listenToAdminRegisterEmailQueue();
  await listenToVendorRegisterEmailQueue();
  await listenToBackOfficeUserInviteEmailQueue();
  await listenToEmployeeRegisterEmailQueue();
  await listenToAdminResetEmailQueue();
  await listenToAdminResendEmailVerificationMessageQueue();
  await listenToAdminInviteEmailQueue();
}