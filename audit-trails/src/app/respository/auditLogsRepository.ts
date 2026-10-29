import { WhereOptions } from "sequelize";
import { AuditLog } from "../models/index";
import { User } from "../types/userTypes";
import { getNextLogIdForOrganization, paginate } from "../utils/utils";
import { GetAuditLogsQuery } from "../types/auditLogTypes";
import { http } from "../services/AxiosClient";
import { service } from "../../config/EnvVariables";

// =========== create log
export const createAuditLogsRepository = async (user: User, payload: any) => {
  try {
    const userData = await http.get(
      `${service.ADMIN_SERVICE_URL}/v1/auth/get-user/${user?.id}`
    );
    console.log(userData.data.data.user);
    const data = payload;
    data.user_id = user?.id;
    data.user_role = userData.data.data.user?.org_role?.role_name;
    data.organization_id = user?.organization_id;
    data.subsidiary_id = user?.subsidiary_id;
    data.subsidiary = userData.data.data.user?.subsidiary?.subsidiary_name;
    data.branch_id = user?.subsidiary_branch_id;
    data.branch = userData.data.data.user?.subsidiary_branch?.branch_name;
    data.department_id = user?.branch_department_id;
    data.department =
      userData.data.data.user?.branch_department?.department_name;
    data.log_id = await getNextLogIdForOrganization(
      user?.organization_id ?? ""
    );

    const result = await AuditLog.create(data);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};

// =========== get logs
export const getUserAuditLogsRepository = async (
  user: User,
  page: number,
  limit: number,
  query: any,
  token: string | undefined
) => {
  try {
    const serachQuery: WhereOptions = {};
    if (query.subsidiary_id) {
      serachQuery.subsidiary_id = query.subsidiary_id;
    }
    const result = await paginate(AuditLog, {
      where: serachQuery,
      limit,
      page,
    });
    const userIds = result?.data?.length
      ? [...new Set(result.data.map((log: any) => log.user_id).filter(Boolean))]
      : [];
    const userData = await http.post(
      `${service.ADMIN_SERVICE_URL}/v1/organization/get-users-by-ids`,
      {
        ids: userIds,
      },
      { token }
    );

    const usersArray = userData?.data?.data;
    const userMap: Record<string, any> = {};
    usersArray.forEach((user: User) => {
      if (user && user.id) {
        userMap[user.id] = user;
      }
    });

    result.data = result.data.map((log: any) => ({
      ...log.get({ plain: true }),
      user: log.user_id ? userMap[log.user_id] || null : null,
    }));
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};

// =========== get log by id
export const getAuditLogByIdRepository = async (id: string) => {
  try {
    const result = await AuditLog.findByPk(id);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message); // keep original message
    }
    throw new Error("An unknown error occurred"); // handle other cases
  }
};
