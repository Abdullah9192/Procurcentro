import { service } from "../../../config/EnvVariables";
import BackofficeUser from "../../models/backoffice-user.entity";
import { BackofficeRole } from "../../models/role.entity";
import { Op } from "sequelize";
import { http } from "../../services/AxiosClient";

interface AssignRoleInput {
  user_ids: string[]; // accept one or multiple user IDs
  role: string;
  permissions: Record<string, string[]>;
  sender_id: string;
  organization_id: string;
}

export const createRole = async (data: { role: string; permissions?: string[] }) => {
  return await BackofficeRole.create(data);
};

export const updateRole = async (id: string, data: { role?: string; permissions?: string[] }) => {
  const role = await BackofficeRole.findByPk(id);
  if (!role) throw new Error("Role not found");
  return await role.update(data);
};

export const deleteRole = async (id: string) => {
  const role = await BackofficeRole.findByPk(id);
  if (!role) throw new Error("Role not found");
  await role.destroy();
  return role;
};

export const getRoleById = async (id: string) => {
  const role = await BackofficeRole.findByPk(id);
  if (!role) throw new Error("Role not found");
  return role;
};

export const listRoles = async () => {
  return await BackofficeRole.findAll();
};

export const assignRoleToUsers = async ({ user_ids, role, permissions, sender_id, organization_id }: AssignRoleInput) => {
  if (!user_ids || !user_ids.length) throw { statusCode: 400, message: 'No user IDs provided' };
  if (!role) throw { statusCode: 400, message: 'Role is required' };

  const users = await BackofficeUser.findAll({
    where: { id: { [Op.in]: user_ids } },
  });

  if (!users.length) throw { statusCode: 404, message: 'No users found for the provided IDs' };

  // Update each user
  for (const user of users) {
    user.role = role;
    user.permissions = permissions;
    await user.save();
  }
  // 🔔 Send notification
    try {
      await http.post(
        `/v1/notification/create`,
        {
          sender_id,
          receiver_id: user_ids,
          organization_id,
          notification_type: "role_updated",
          notification_module: "user_management",
          message: `Your role has been updated to ${role}.`,
        },
        {
          baseURL: service.NOTIFICATION_SERVICE_URL,
        }
      );
    } catch (err) {
      console.error("Notification failed:", err);
    }

  return { updated_users: users };
};

