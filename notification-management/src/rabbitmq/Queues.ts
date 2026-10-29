export const RBT_ADMIN_QUEUES = {
  ADMIN_REGISTER_QUEUE: "admin.service.created",
  ADMIN_RESET_EMAIL_QUEUE:"admin.service.reset_email",
  ADMIN_RESEND_EMAIL_VERIFICATION_QUEUE:"admin.service.resend_email_verification",
  INVITE_ADMIN_QUEUE:"invite.admin.register",
};
 
export const RBT_EMPLOYEE_QUEUES = {
  EMPLOYEE_REGISTER_QUEUE: "employee.service.created",
};

export const RBT_VENDOR_QUEUES = {
  VENDOR_REGISTER_QUEUE: "vendor.service.created",
  VENDOR_INVITE_QUEUE: "vendor.service.invite",
  PURCHASE_ORDER_CONTRACT_QUEUE: "purchase.order.contract.queue"
};

export const RBT_BACKOFFICE_QUEUES = {
  // BACKOFFICE_REGISTER_QUEUES: "backoffice.service.created",
    BACKOFFICE_INVITE_QUEUE: "backoffice.service.invite",
};