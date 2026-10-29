import { Op, or, Transaction } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User, { UserWithRelations } from "../../models/User";
import Organization from "../../models/Organization";
import Role from "../../models/Role";
import OrgRole from "../../models/OrgRole";
import Module from "../../models/Module";
import OrgRoleModulePermission from "../../models/OrgRoleModulePermission";
import { sendVerificationEmail } from "../../utils/emails/templates/SendVerificationEmailUtils";
import { ADMIN_FRONTEND_URL } from "../../../config/EnvVariables";
import { sendEmail } from "../../utils/general/MailerUtils";
import { BaseService } from "../../services/BaseService";
import { generateToken } from "../../utils/general/JwtUtils";
import { generateResetEmailTemplate } from "../../utils/emails/templates/ResetPasswordRequestUtils";
import { publishToQueue } from "../../../rabbitmq/Producer";
import { RBT_ADMIN_QUEUES } from "../../../rabbitmq/Queues";
import { adminEvents } from "../../../rabbitmq/Events";
import { generateUserIdNo } from "../../services/UserService";
import Subsidiary from "../../models/Subsidiary";
import SubsidiaryBranch from "../../models/SubsidiaryBranch";
import BranchDepartment from "../../models/BranchDepartment";
import { createVendorEvaluation } from "../../v1/controllers/vendor/VendorEvaluationCntroller";
import { upsertDashboardService } from "../admindashboard/AdminDashboard";

interface RegisterDTO {
  name: string;
  organization_name: string;
  country: string;
  email: string;
  password: string;
}

// Initialize services
const userService = new BaseService(User);
const organizationService = new BaseService(Organization);
const roleService = new BaseService(Role);
const orgRoleService = new BaseService(OrgRole);
const moduleService = new BaseService(Module);
const orgRoleModulePermissionService = new BaseService(OrgRoleModulePermission);

// ========  Register User :
export const executeRegister = async (
  data: RegisterDTO,
  transaction: Transaction
) => {
  const { name, organization_name, country, email, password } = data;

  // 1. Check for existing user
  const existingUser = await userService.findOne({
    where: { email },
    transaction,
  });

  if (existingUser) {
    return {
      success: false,
      statusCode: 400,
      message: "User with this email already exists.",
    };
  }

  const existingOrg = await organizationService.findOne({
    where: { name: organization_name },
    transaction,
  });

  if (existingOrg) {
    return {
      success: false,
      statusCode: 400,
      message: "Organization with this name already exists.",
    };
  }

  // 2. Create Organization
  const organization = await organizationService.create(
    {
      name: organization_name,
      country,
    },
    { transaction }
  );

  // 🔹 Create default Admin Dashboard Widget (ALL TRUE)
  await upsertDashboardService(
    {
      organization_id: organization.id,

      total_spend: true,
      total_purchase_orders: true,
      average_request_to_po_time: true,
      budget_utilization: true,
      purchase_requests: true,
      pending_approvals: true,
      purchase_orders: true,
      receiving_status: true,
      invoices: true,
      to_do_list: true,
      procurement_trends: true,
      expenses_by_department: true,
      vendor_insights: true,
      category_analysis: true,
      process_efficiency: true,
      customized_dashboard_name: true,
    }
  );

  // create default vendor evaluation
  await createVendorEvaluation(
    {
      organization_id: organization.id,
      quality: "How satisfied are you with the overall quality of the items delivered?",
      timeliness: "How quickly does the vendor fulfill orders?",
      issue_resolution: "How effective is the vendor in resolving complaints or product issues?",
      adherence: "How accurate are the shipments in terms of product type, quantity, and packaging?",
      communication: "How clear and professional is the vendor's communication?",
      overall: "How would you rate your overall experience working with this vendor?",
    },
    { transaction, returning: true }
  );

  // 3. Copy Roles → OrgRoles
  const DEFAULT_ROLES = [
    {
      role_name: "Admin",
      description:
        "Manages system settings, user roles, permissions, and oversees overall platform operations",
    },
    {
      role_name: "Vendor",
      description:
        "Provides goods or services, responds to requests, submits quotes, and manages order fulfillment",
    },
    {
      role_name: "Requestor",
      description:
        "Creates requests for items or services, tracks approvals, and monitors orders and deliveries",
    },
    {
      role_name: "Approver",
      description:
        "Reviews and approves requests, ensuring compliance and alignment with organizational goals",
    },
    {
      role_name: "Procurement Manager",
      description:
        "Manages vendors, contracts, inventory, and procurement workflows",
    },
    {
      role_name: "Finance",
      description:
        "Tracks budgets, validates invoices, processes claims, and generates reports",
    },
    {
      role_name: "Legal",
      description:
        "Oversees contracts and vendor agreements",
    },
  ];

  const orgRoles = await orgRoleService.bulkCreate(
    DEFAULT_ROLES.map((role) => ({
      ...role,
      organization_id: organization.id,
    })),
    { transaction, returning: true }
  );

  // 4. Find Admin OrgRole
  const adminOrgRole = orgRoles.find((r) => r.role_name === "Admin");
  if (!adminOrgRole) {
    return {
      success: false,
      statusCode: 404,
      message: "Admin role not found in organization roles.",
    };
  }

  // 5. Assign Modules to Admin OrgRole
  const roleModuleMap: Record<string, string[]> = {
    Admin: [], // will get ALL modules

    Vendor: [
      "Quotations",
      "Purchase Order",
      "Inventory",
      "Reports",
    ],

    Requestor: [
      "Requisition",
      "Quotations",
      "Receiving",
      "Reports",
      "System Settings",
    ],

    "Procurement Manager": [
      "Requisition",
      "Quotations",
      "Receiving",
      "Approvals",
      "Purchase Order",
      "Vendor Management",
      "Inventory",
      "Contract Management",
      "Reports",
      "System Settings",
    ],

    Finance: [
      "Purchase Order",
      "Invoice",
      "Budget",
      "Reports",
      "System Settings",
    ],

    Approver: [
      "Approvals",
      "Reports",
      "System Settings",
    ],

    Legal: [
      "Quotations",
      "Contract Management",
      "Approvals",
      "Reports",
      "System Settings",
    ],
  };

  const modules = await moduleService.findAll({ transaction });

  if (!modules.length) {
    throw new Error("Modules not found. Seed modules first.");
  }

  // module name → id map
  const moduleMap = new Map(modules.map(m => [m.name, m.id]));

  const permissions: any[] = [];

  for (const orgRole of orgRoles) {
    const roleName = orgRole.role_name;

    // 🔹 Admin → assign ALL modules
    if (roleName === "Admin") {
      for (const module of modules) {
        permissions.push({
          module_id: module.id,
          org_role_id: orgRole.id,
          organization_id: organization.id,
        });
      }
      continue;
    }

    // 🔹 Other roles → assign from map
    const moduleNames = roleModuleMap[roleName];
    if (!moduleNames) continue;

    for (const moduleName of moduleNames) {
      const moduleId = moduleMap.get(moduleName);
      if (!moduleId) {
        throw new Error(`Module not found: ${moduleName}`);
      }

      permissions.push({
        module_id: moduleId,
        org_role_id: orgRole.id,
        organization_id: organization.id,
      });
    }
  }

  await orgRoleModulePermissionService.bulkCreate(permissions, { transaction });

  // 6. Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await publishToQueue(RBT_ADMIN_QUEUES.ADMIN_REGISTER_QUEUE, {
    event: adminEvents.verify_admin_email,
    data: { email: email, token: token, username: name },
  });

  const userIdNo = await generateUserIdNo("admin", transaction);
  const user = await userService.create(
    {
      user_id_no: userIdNo,
      name,
      email,
      password: hashedPassword,
      organization_id: organization.id,
      org_role_id: adminOrgRole.id,
      country,
      is_email_verified: false,
      is_owner: true,
      user_type: "admin",
      email_verification_token: token,
      email_verification_expires: expires,
      supplier_approval_type: null,
    },

    { transaction }
  );

  // 7. Send verification email
  // const html = sendVerificationEmail({
  //   resetUrl: `${ADMIN_FRONTEND_URL}/email-verification?token=${token}`,
  //   username: user.name,
  // });

  // await sendEmail({
  //   to: user.email,
  //   subject: "Email Verification",
  //   html,
  // });

  return {
    success: true,
    statusCode: 201,
    message: "User registered successfully!",
    data: user,
  };
};

// ======== Login User :
export const executeLogin = async (
  { email, password }: { email: string; password: string },
  transaction: Transaction
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await User.findOne({
    where: { email },
    include: [
      { model: Organization, as: "organization" },
      { model: OrgRole, as: "org_role" },
    ],
    transaction,
  });

  if (!user) {
    return {
      success: false,
      statusCode: 403,
      message: "Invalid email.",
    };
  }

  const COOLDOWN_MINUTES = 15;

  if (user.login_count !== null && user.login_count >= 5) {
    if (user.login_time) {
      const now = new Date();
      const diffMinutes =
        (now.getTime() - new Date(user.login_time).getTime()) / (1000 * 60);

      if (diffMinutes < COOLDOWN_MINUTES) {
        return {
          success: false,
          statusCode: 429,
          message: "Too many login attempts. Please try again after 15 minutes.",
        };
      }

      await user.update(
        {
          login_count: 0,
          login_time: null,
        },
        { transaction }
      );
    }
  }

  if (user.user_type !== "admin") {
    return {
      success: false,
      statusCode: 403,
      message: "Permission denied , You are not enrolled as a admin",
    };
  }

  if (!user.is_email_verified) {
    const tokenSend = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userService.update(
      {
        email_verification_token: tokenSend,
        email_verification_expires: expires,
      },
      {
        where: { id: user.id },
        transaction,
      }
    );

    const resetUrl = `${ADMIN_FRONTEND_URL}/email-verification?token=${tokenSend}`;
    const username = user.name;
    await publishToQueue(
      RBT_ADMIN_QUEUES.ADMIN_RESEND_EMAIL_VERIFICATION_QUEUE,
      {
        event: adminEvents.resend_email_verfication,
        data: { email: email, resetUrl: resetUrl, username: username },
      }
    );
    return {
      success: false,
      statusCode: 400,
      message:
        "Please verify your email before logging in , Verfication Link has been sent to your email.",
    };
  }
  if (!user.is_active) {
    return {
      success: false,
      statusCode: 402,
      message:
        "Your account is currently inactive. Please contact support for assistance.",
    };
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const newCount = (user.login_count || 0) + 1;
    await user.update(
      {
        login_count: newCount,
        login_time: new Date(),
      },
      { transaction }
    );
    return {
      success: false,
      statusCode: 403,
      message: "Invalid Password",
    };
  }

  if (user.login_count && user.login_count > 0) {
    await user.update(
      {
        login_count: 0,
        login_time: null,
      },
      { transaction }
    );
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    is_active: user.is_active,
    organization_id: user.organization?.id,
    org_role_id: user.org_role_id,
    user_role: user.org_role?.role_name,
    user_type: user.user_type,
  });

  // Convert Sequelize instance to plain object
  const userPlain = user.get({ plain: true }) as UserWithRelations;

  // Destructure password and organization
  const { password: _, organization, ...userWithoutPassword } = userPlain;

  return {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: {
      token,
      user: userWithoutPassword,
      organization,
    },
  };
};

export const executeSetPassword = async (
  { email, password }: { email: string; password: string },
  transaction: Transaction
) => {
  const user = await User.findOne({
    where: { email },
    include: [
      { model: Organization, as: "organization" },
      { model: OrgRole, as: "org_role" },
    ],
    transaction,
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  if (user.user_type !== "admin") {
    return {
      success: false,
      statusCode: 403,
      message: "Only admin can set password here",
    };
  }

  if (!user.is_email_verified || !user.is_active) {
    return {
      success: false,
      statusCode: 403,
      message: "Your email is not verified yet.",
    };
  }

  if (user.password) {
    return {
      success: false,
      statusCode: 400,
      message: "Password already set",
    };
  }

  // 🔹 hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  await user.update(
    {
      password: hashedPassword,
    },
    { transaction }
  );

  // 🔹 generate token (same as login)
  const token = await generateToken({
    id: user.id,
    email: user.email,
    is_active: user.is_active,
    organization_id: user.organization?.id,
    org_role_id: user.org_role_id,
    user_role: user.org_role?.role_name,
    user_type: user.user_type,
  });

  const userPlain = user.get({ plain: true }) as any;
  const { password: _, organization, ...userWithoutPassword } = userPlain;

  return {
    success: true,
    statusCode: 200,
    message: "Password set successfully",
    data: {
      token,
      user: userWithoutPassword,
      organization,
    },
  };
};

// ======== Reset Password  :
export const executePasswordResetRequest = async (
  { email }: { email: string },
  transaction: Transaction
) => {
  try {
    const user = await userService.findOne({
      where: { email },
      transaction,
    });

    if (!user) {
      return {
        success: false,
        message: "No user found with this email",
        statusCode: 404,
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await userService.update(
      {
        reset_password_token: token,
        reset_password_expires: expires,
      },
      {
        where: { id: user.id },
        transaction,
      }
    );

    // const html = generateResetEmailTemplate({
    //   resetUrl: `${ADMIN_FRONTEND_URL}/reset-password?token=${token}`,
    //   username: user.name,
    // });
    const resetUrl = `${ADMIN_FRONTEND_URL}/reset-password?token=${token}`;
    const username = user.name;

    await publishToQueue(RBT_ADMIN_QUEUES.ADMIN_RESET_EMAIL_QUEUE, {
      event: adminEvents.reset_admin_email,
      data: { email: email, resetUrl: resetUrl, username: username },
    });
    // await sendEmail({
    //   to: user.email,
    //   subject: "Reset Your Password",
    //   html,
    // });

    return {
      success: true,
      message: "Password reset email sent successfully",
      statusCode: 200,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to process password reset request",
      statusCode: 500,
    };
  }
};

export const executeResetPassword = async (
  {
    token,
    new_password,
  }: {
    token: string;
    new_password: string;
  },
  transaction: Transaction
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await User.findOne({
    where: {
      reset_password_token: token,
      reset_password_expires: {
        [Op.gt]: new Date(),
      },
    },
    transaction,
  });

  if (!user) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid or expired token",
    };
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);

  await userService.update(
    {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    },
    {
      where: { id: user.id },
      transaction,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Password updated successfully",
  };
};

export const executeEmailVerification = async (
  token: string,
  transaction: Transaction
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await User.findOne({
    where: {
      email_verification_token: token,
      email_verification_expires: {
        [Op.gt]: new Date(),
      },
    },
    transaction,
  });

  if (!user) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid or expired verification link",
    };
  }

  await userService.update(
    {
      is_email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
    },
    {
      where: { id: user.id },
      transaction,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Email verified successfully!",
  };
};

export const executeResendVerificationEmail = async (
  { email }: { email: string },
  transaction: Transaction
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await userService.findOne({
    where: { email },
    transaction,
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  if (user.is_email_verified) {
    return {
      success: false,
      statusCode: 400,
      message: "Email already verified",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await userService.update(
    {
      email_verification_token: token,
      email_verification_expires: expires,
    },
    {
      where: { id: user.id },
      transaction,
    }
  );

  const resetUrl = `${ADMIN_FRONTEND_URL}/email-verification?token=${token}`;
  const username = user.name;

  await publishToQueue(RBT_ADMIN_QUEUES.ADMIN_RESEND_EMAIL_VERIFICATION_QUEUE, {
    event: adminEvents.resend_email_verfication,
    data: { email: email, resetUrl: resetUrl, username: username },
  });
  // const html = sendVerificationEmail({
  //   resetUrl: `${ADMIN_FRONTEND_URL}/email-verification?token=${token}`,
  //   username: user.name,
  // });

  // await sendEmail({
  //   to: user.email,
  //   subject: "Email Verification",
  //   html,
  // });

  return {
    success: true,
    statusCode: 200,
    message: "Verification email sent successfully",
  };
};

export const executeGetMe = async ({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await userService.findById(userId, {
    include: [
      { model: Organization, as: "organization" },
      {
        model: OrgRole,
        as: "org_role",
        include: [
          {
            model: OrgRoleModulePermission,
            as: "org_role_module_permissions",
            include: [
              {
                model: Module,
                as: "module",
              },
            ],
          },
        ],
      },
    ],
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  const organization = user.organization;
  const { password: _, organization: __, ...userData } = user;

  return {
    success: true,
    statusCode: 200,
    message: "User fetched successfully",
    data: {
      organization: organization,
      user: {
        ...userData,
        role_name: user.org_role?.role_name,
      },
    },
  };
};

export const executeGetUser = async ({
  userId,
}: {
  userId: string;
}): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await userService.findById(userId, {
    include: [
      {
        model: OrgRole,
        as: "org_role",
        include: [
          {
            model: OrgRoleModulePermission,
            as: "org_role_module_permissions",
            include: [
              {
                model: Module,
                as: "module",
              },
            ],
          },
        ],
      },
      {
        model: Subsidiary,
        as: "subsidiary",
      },
      {
        model: SubsidiaryBranch,
        as: "subsidiary_branch",
      },
      {
        model: BranchDepartment,
        as: "branch_department",
      },
    ],
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  const organization = user.organization;
  const { password: _, organization: __, ...userData } = user;

  return {
    success: true,
    statusCode: 200,
    message: "User fetched successfully",
    data: {
      user: userData,
      organization: organization,
    },
  };
};

export const executeGetUserByEmail = async ({
  email,
}: {
  email: string;
}): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await userService.findOne({ where: { email } });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  // password ko return me include nahi karna
  const { password: _, ...userData } = user;

  return {
    success: true,
    statusCode: 200,
    message: "User fetched successfully",
    data: userData,
  };
};

export const executeUpdateUserById = async ({
  id,
  google_id,
  is_active
}: {
  id: string;
  google_id?: string;
  is_active?: boolean;
}): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const user = await userService.findOne({ where: { id } });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  if (google_id !== undefined) {
    user.google_id = google_id;
  }

  if (is_active !== undefined) {
    user.is_active = is_active;
  }

  await user.save();

  const { password: _, ...userData } = user.toJSON();

  return {
    success: true,
    statusCode: 200,
    message: "User updated successfully",
    data: userData,
  };
};

export const executeChangePassword = async (
  user: any,
  data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  },
  transaction: Transaction
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  const { current_password, new_password } = data;

  const existingUser = await userService.findOne({ where: { id: user.id } });
  if (!existingUser) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found",
    };
  }

  const isMatch = await bcrypt.compare(current_password, existingUser.password);
  if (!isMatch) {
    return {
      success: false,
      statusCode: 401,
      message: "Current password is incorrect",
    };
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);

  await userService.update(
    {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    },
    {
      where: { id: user.id },
      transaction,
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Password updated successfully",
  };
};

export const executeVendorLogin = async (
  { email, password }: { email: string; password: string },
  transaction: Transaction
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}> => {
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: OrgRole, as: "org_role" }],
      transaction,
    });

    // ❌ User not found
    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "Invalid email.",
      };
    }

    const COOLDOWN_MINUTES = 15;

    // 🔒 Account lock logic
    if ((user.login_count ?? 0) >= 5) {
      if (user.login_time) {
        const now = new Date();
        const diffMinutes =
          (now.getTime() - new Date(user.login_time).getTime()) / (1000 * 60);

        if (diffMinutes < COOLDOWN_MINUTES) {
          return {
            success: false,
            statusCode: 429,
            message:
              "Too many login attempts. Please try again after 15 minutes.",
          };
        }

        // ✅ Reset after cooldown
        await user.update(
          {
            login_count: 0,
            login_time: null,
          },
          { transaction }
        );
      }
    }

    // ❌ Not a vendor
    if (user.user_type !== "vendor") {
      return {
        success: false,
        statusCode: 403,
        message:
          "Permission denied, you are not registered as a vendor.",
      };
    }

    // ❌ Email not verified
    if (!user.is_email_verified) {
      return {
        success: false,
        statusCode: 400,
        message: "Please verify your email before logging in.",
      };
    }

    // ❌ Inactive account
    if (!user.is_active) {
      return {
        success: false,
        statusCode: 403,
        message:
          "Your account is inactive. Please contact support.",
      };
    }

    // ❗ IMPORTANT: Password not set (signup required)
    if (!user.password) {
      return {
        success: false,
        statusCode: 400,
        message:
          "Your account is not set up yet. Please sign up and set your password first.",
      };
    }

    // 🔑 Password check
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      const newCount = (user.login_count || 0) + 1;

      await user.update(
        {
          login_count: newCount,
          login_time: new Date(),
        },
        { transaction }
      );

      return {
        success: false,
        statusCode: 401,
        message: "Invalid password.",
      };
    }

    // ✅ Reset login attempts on success
    if ((user.login_count ?? 0) > 0) {
      await user.update(
        {
          login_count: 0,
          login_time: null,
        },
        { transaction }
      );
    }

    // 🎟️ Generate token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      organization_id: user.organization_id,
      org_role_id: user.org_role_id,
      user_role: user.org_role?.role_name,
      user_type: user.user_type,
    });

    const { password: _, ...userData } = user.get({ plain: true });

    return {
      success: true,
      statusCode: 200,
      message: "Vendor login successful.",
      data: {
        token,
        user: userData,
      },
    };
  } catch (error: any) {
    // ❌ No generic 500 — return actual error
    return {
      success: false,
      statusCode: 400,
      message: error?.message || "Login failed.",
    };
  }
};