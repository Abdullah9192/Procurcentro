import { Op, Transaction } from "sequelize";
import Organization from "../../models/Organization";
import OrgRole from "../../models/OrgRole";
import OrgRoleModulePermission from "../../models/OrgRoleModulePermission";
import Module from "../../models/Module";
import User from "../../models/User";
import { generateUserIdNo } from "../../services/UserService";
import { RBT_ADMIN_QUEUES, RBT_EMPLOYEE_QUEUES } from "../../../rabbitmq/Queues";
import { publishToQueue } from "../../../rabbitmq/Producer";
import { adminEvents, employeeEvents } from "../../../rabbitmq/Events";
import Subsidiary from "../../models/Subsidiary";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export interface InviteUserDTO {
  name: string;
  email: string;
  organization_id: string;
  subsidiary_id?: string;
  subsidiary_branch_id: string;
  branch_department_id: string;
  org_role_id: string;
  is_head_department: boolean;
}
// === executeGetRoles
export const executeGetRoles = async (payload: any, user: any) => {
  try {
    const { page, limit, search } = payload;
    const organization_id = user.organization_id;

    // Check organization
    const organizationExist = await Organization.findOne({
      where: { id: organization_id },
    });

    if (!organizationExist) {
      return {
        success: false,
        statusCode: 400,
        message: "Organization ID does not exist",
      };
    }

    const whereCondition: any = {
      organization_id,
      role_name: {
        [Op.notIn]: ["Admin", "Vendor"],
      },
    };

    if (search && search.trim()) {
      whereCondition.role_name = {
        ...whereCondition.role_name,
        [Op.iLike]: `%${search.trim()}%`,
      };
    }

    // 👉 If no pagination
    if (!page || !limit) {
      const roles = await OrgRole.findAll({
        where: whereCondition,
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
        order: [["role_name", "ASC"]],
      });

      return {
        success: true,
        statusCode: 200,
        message: "Organization roles fetched successfully",
        data: roles || [],
      };
    }

    // 👉 Pagination logic
    const currentPage = Number(page) || 1;
    const currentLimit = Math.min(Number(limit) || 10, 100);
    const offset = (currentPage - 1) * currentLimit;

    const { count: totalCount, rows: roles } = await OrgRole.findAndCountAll({
      where: whereCondition,
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
      limit: currentLimit,
      offset,
      order: [["role_name", "ASC"]],
      distinct: true,
    });

    const totalPages = Math.ceil(totalCount / currentLimit);

    return {
      success: true,
      statusCode: 200,
      message: "Organization roles fetched successfully",
      data: {
        roles: roles || [],
        pagination: {
          currentPage,
          limit: currentLimit,
          offset,
          totalPages,
          totalCount,
          currentCount: roles.length,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        }
      },
    };
  } catch (error: any) {
    console.error("GetRoles Error:", error);
    return {
      success: false,
      statusCode: 500,
      message: error?.original?.message || "Internal server error",
    };
  }
};

// ==== executeAddRoles
export const executeAddRole = async (
  payload: any,
  user: any,
  transaction: any
) => {
  const { role_name, description, module_ids } = payload;
  const organization_id = user.organization_id;

  // 1. Check organization
  const organizationExist = await Organization.findOne({
    where: { id: organization_id },
    transaction,
  });
  if (!organizationExist) {
    return {
      success: false,
      statusCode: 400,
      message: "Organization does not exist",
    };
  }

  // 2. Create role
  const newRole = await OrgRole.create(
    { role_name, description: description || null, organization_id },
    { transaction }
  );

  // 3. Default role permissions
  const defaultRolePermissions: Record<string, string[]> = {
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
      "Contracts",
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
    Approver: ["Approvals", "Reports", "System Settings"],
    Legal: [
      "Quotations",
      "Contract Management",
      "Approvals",
      "Reports",
      "System Settings",
    ],
  };

  let defaultModules: string[] = [];
  if (defaultRolePermissions[role_name]) {
    defaultModules = defaultRolePermissions[role_name];
  }

  // 4. Combine user modules (if not default)
  const userModules = (module_ids || []).filter((m: string) => !defaultModules.includes(m));
  const combinedModules = [...defaultModules, ...userModules];

  if (combinedModules.length === 0) {
    // No modules to add
    return {
      success: true,
      statusCode: 200,
      message: "Role created but no modules to assign.",
      data: newRole,
    };
  }

  // 5. Fetch modules from DB
  const modules = await Module.findAll({
    where: { name: { [Op.in]: combinedModules } },
    transaction,
  });

  if (modules.length === 0) {
    return {
      success: true,
      statusCode: 200,
      message: "Role created but modules not found in database.",
      data: newRole,
    };
  }

  // 6. Bulk create permissions
  const permissionEntries = modules.map((m) => ({
    org_role_id: newRole.id,
    module_id: m.id,
    organization_id,
  }));

  await OrgRoleModulePermission.bulkCreate(permissionEntries, { transaction });

  return {
    success: true,
    statusCode: 200,
    message: "Organization role created successfully with modules.",
    data: newRole,
  };
};

// executeUpdateRole
export const executeUpdateRole = async (
  roleId: string,
  payload: any,
  user: any,
  transaction: Transaction
) => {
  const { role_name, description, module_ids } = payload;
  const organization_id = user.organization_id;

  const existingRole = await OrgRole.findOne({
    where: { id: roleId, organization_id },
    transaction,
  });

  if (!existingRole) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization role not found",
    };
  }

  await existingRole.update({ role_name, description }, { transaction });

  if (module_ids) {
    // Delete existing permissions
    await OrgRoleModulePermission.destroy({
      where: { org_role_id: roleId, organization_id },
      transaction,
    });

    // Insert new permissions if provided
    if (module_ids.length > 0) {
      const modulePermissions = module_ids.map((module_id: string) => ({
        org_role_id: roleId,
        module_id,
        organization_id,
      }));

      await OrgRoleModulePermission.bulkCreate(modulePermissions, {
        transaction,
      });
    }
  }

  return {
    success: true,
    statusCode: 200,
    message: "Organization role updated successfully",
    data: existingRole,
  };
};

// execute role detail by id
export const executeGetRole = async (
  roleId: string,
  organizationId: string
) => {
  const role = await OrgRole.findOne({
    where: { id: roleId, organization_id: organizationId },
    include: [
      {
        model: OrgRoleModulePermission,
        as: "org_role_module_permissions",
        include: [
          {
            model: Module,
            as: "module",
            attributes: ["id", "name"], // Select only needed fields
          },
        ],
      },
    ],
  });

  if (!role) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization role not found",
    };
  }

  // Extract module_ids cleanly
  const moduleIds =
    role.org_role_module_permissions?.map((perm: any) => ({
      id: perm.module?.id,
      module_name: perm.module?.name,
    })) || [];

  return {
    success: true,
    statusCode: 200,
    message: "Organization role fetched successfully",
    data: {
      id: role.id,
      role_name: role.role_name,
      description: role.description,
      module_permissions: moduleIds,
    },
  };
};

// execute Delete Role
export const executeDeleteRole = async (
  roleId: string,
  organizationId: string,
  transaction: Transaction
) => {
  const role = await OrgRole.findOne({
    where: { id: roleId, organization_id: organizationId },
    transaction,
  });

  if (!role) {
    return {
      success: false,
      statusCode: 404,
      message: "Organization role not found",
    };
  }

  // ✅ Automatically deletes associated module permissions if 'CASCADE' is defined
  await role.destroy({ transaction });

  return {
    success: true,
    statusCode: 200,
    message: "Organization role deleted successfully",
  };
};

// ====== Deactivate / Activate Role
export const executeDeactivateRole = async (
  id: string,
  user: any,
  transaction: Transaction
) => {
  const roleData = await OrgRole.findOne({
    where: { id, organization_id: user.organization_id },
    transaction,
  });
  if (!roleData) {
    return {
      success: false,
      statusCode: 404,
      message: "Role not found.",
    };
  }
  const newStatus = !roleData.is_active;
  await roleData.update({ is_active: newStatus }, { transaction });
  return {
    success: true,
    statusCode: 200,
    message: `Role ${newStatus ? "activated" : "deactivated"} successfully.`,
  };
};

export const executeGetOrganizationEmployeeList = async (
  user: any,
  page: number,
  limit: number,
  search?: string,
  status?: string
) => {
  const organization_id = user.organization_id;
  const offset = (page - 1) * limit;

  let whereCondition: any = {
    organization_id,
    user_type: "employee",
  };

  /* status filter */
  if (status === "0") whereCondition.is_active = false;
  else if (status === "1") whereCondition.is_active = true;

  /* search filter */
  if (search) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { "$org_role.role_name$": { [Op.iLike]: `%${search}%` } },
      ],
    };
  }

  const { rows, count } = await User.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: OrgRole,
        as: "org_role",
        attributes: ["id", "role_name"],
      },
      {
        model: Subsidiary,
        as: "subsidiary",
      },
    ],
    limit,
    offset,
    distinct: true,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Employee list fetched successfully.",
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

// executeGetAdminUsersList
export const executeGetAdminUsersList = async (user: any) => {
  const organization_id = user.organization_id;
  const adminList = await User.findAll({
    where: {
      organization_id,
      user_type: "admin"
    },
  });
  return {
    success: true,
    statusCode: 200,
    message: "Admin list fetched successfully.",
    data: adminList,
  };
};

// executeDeactivateUser
export const executeDeactivateUser = async (
  user: any,
  userId: string,
  transaction: Transaction
) => {
  const organization_id = user.organization_id;

  const existingUser = await User.findOne({
    where: {
      id: userId,
      organization_id,
    },
    transaction,
  });

  if (!existingUser) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found.",
    };
  }

  const newStatus = !existingUser.is_active;

  await existingUser.update(
    {
      is_active: newStatus,
    },
    { transaction }
  );

  return {
    success: true,
    statusCode: 200,
    message: newStatus
      ? "User activated successfully."
      : "User deactivated successfully.",
  };
};

// executeTransferOwnerShip
export const executeTransferOwnerShip = async (
  user: any,
  userId: string,
  transaction: Transaction
) => {
  // Step 1: Check current owner
  const currentOwner = await User.findOne({
    where: {
      id: user.id,
      organization_id: user.organization_id,
      is_owner: true,
    },
    transaction,
  });

  if (!currentOwner) {
    return {
      success: false,
      statusCode: 404,
      message: "You are not eligible for this action.",
    };
  }

  // Step 2: Check new user exists
  const newOwner = await User.findOne({
    where: {
      id: userId,
      organization_id: user.organization_id,
      is_active: true,
    },
    transaction,
  });

  if (!newOwner) {
    return {
      success: false,
      statusCode: 404,
      message: "User account not found or inactive.",
    };
  }

  // Step 3: Transfer ownership
  await currentOwner.update({ is_owner: false, user_type: "admin" }, { transaction });
  await newOwner.update({ is_owner: true, user_type: "admin" }, { transaction });

  return {
    success: true,
    statusCode: 200,
    message: "Ownership has been transferred!",
    data: [{ previous_owner: currentOwner }, { current_user: newOwner }],
  };
};

// executeGetPermissionModules
export const executeGetPermissionModules = async () => {
  const modules = await Module.findAll();
  return {
    success: true,
    statusCode: 200,
    message: "Modules fetched successfully",
    data: modules,
  };
};

// ===== User Invite

// executeInviteUsers
export const executeInviteUsers = async (
  user: any,
  payload: InviteUserDTO[],
  transaction: Transaction
) => {
  const organization_id = user.organization_id;

  // Extract all emails
  const emails = payload.map((item) => item.email);

  let emailPayloads: {
    email: string;
    user_name: string;
  }[] = [];

  // STEP 1: Find users that already exist in organization
  const existingUsers = await User.findAll({
    where: {
      email: { [Op.in]: emails },
      // organization_id,
      // user_type: "employee",
    },
    transaction,
  });

  const existingEmails = existingUsers.map((u) => u.email);

  // STEP 2: Filter only NEW users
  const newUsers = payload.filter(
    (item) => !existingEmails.includes(item.email)
  );

  // STEP 3: Build data for NEW users only
  const enrichedUsers = await Promise.all(
    newUsers.map(async (item) => {
      const userIdNo = await generateUserIdNo("employee", transaction);

      // Collect email payload only for new users
      emailPayloads.push({
        email: item.email,
        user_name: item.name,
      });

      return {
        ...item,
        organization_id,
        user_type: "employee" as "employee",
        is_active: true,
        is_email_verified: false,
        created_by: user.id,
        user_id_no: userIdNo,
      };
    })
  );

  // STEP 4: Publish email only for NEW users
  if (emailPayloads.length > 0) {
    await publishToQueue(RBT_EMPLOYEE_QUEUES.EMPLOYEE_REGISTER_QUEUE, {
      event: employeeEvents.send_employee_email,
      data: emailPayloads,
    });
  }

  // STEP 5: Create only NEW users
  const invitedUsers = enrichedUsers.length
    ? await User.bulkCreate(enrichedUsers, { transaction })
    : [];

  return {
    success: true,
    statusCode: 200,
    message: "Users processed successfully.",
    data: {
      added: invitedUsers,     // new users only
      skipped: existingEmails, // existing users (not created, no email)
    },
  };
};

export const executeUpdateUser = async (
  user: any,
  userId: string,
  payload: InviteUserDTO,
  transaction: Transaction
) => {
  const organization_id = user.organization_id;

  const existingUser = await User.findOne({
    where: {
      id: userId,
      organization_id,
    },
    transaction,
  });

  if (!existingUser) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found.",
    };
  }

  // check email duplicate
  const duplicateEmail = await User.findOne({
    where: {
      email: payload.email,
      id: { [Op.ne]: userId },
    },
    transaction,
  });

  if (duplicateEmail) {
    return {
      success: false,
      statusCode: 400,
      message: "Email already exists.",
    };
  }

  await existingUser.update(
    {
      name: payload.name,
      email: payload.email,
      subsidiary_id: payload.subsidiary_id,
      branch_department_id: payload.branch_department_id,
      subsidiary_branch_id: payload.subsidiary_branch_id,
      org_role_id: payload.org_role_id,
      is_head_department: payload.is_head_department,
    },
    { transaction }
  );

  return {
    success: true,
    statusCode: 200,
    message: "User updated successfully.",
    data: existingUser,
  };
};

// executeInviteAdmin
export const executeInviteAdmin = async (
  user: any,
  payload: { name: string; email: string },
  transaction: Transaction
) => {
  const { name, email } = payload;

  const existingUser = await User.findOne({
    where: { email },
    transaction,
  });

  if (existingUser) {
    await existingUser.update(
      {
        user_type: "admin",
        is_active: true,
        is_owner: false,
      },
      { transaction }
    );

    return {
      success: true,
      statusCode: 200,
      message: "User promoted to admin successfully.",
      data: existingUser,
    };
  }

  // 🔹 generate token
  const token = crypto.randomBytes(32).toString("hex");

  const newUser = await User.create(
    {
      name,
      email,
      organization_id: user.organization_id,
      user_type: "admin",
      is_active: false,
      is_email_verified: false,
      is_owner: false,
      created_by: user.id,
      org_role_id: user.org_role_id,
      invite_token: token,
    },
    { transaction }
  );

  // 🔹 send email with redirect link
  await publishToQueue(RBT_ADMIN_QUEUES.INVITE_ADMIN_QUEUE, {
    event: adminEvents.invite_admin_email,
    data: {
      email,
      username: name,
      inviteUrl: `${process.env.ADMIN_BACKEND_URL}/accept-invite?token=${token}`,
    },
  });

  return {
    success: true,
    statusCode: 200,
    message: "Admin invited successfully.",
    data: newUser,
  };
};

export const executeAcceptInvite = async (token: string) => {
  console.log("admin token", token)
  const user = await User.findOne({
    where: { invite_token: token },
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "Invalid or expired invite link",
    };
  }

  await user.update({
    is_email_verified: true,
    is_active: true,
    invite_token: null,
  });

  return {
    success: true,
    statusCode: 200,
    message: "Invite accepted successfully",
    data: {
      email: user.email,
    },
  };

};

// get user by ids
export const executeGetUsersByIds = async (ids: string[]) => {
  try {
    console.log(ids);
    const result = await User.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      attributes: ['id', 'email', 'name']
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};
