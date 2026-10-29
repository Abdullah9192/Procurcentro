import { service } from "../../../config/EnvVariables";
import { http } from "../../services/AxiosClient";
export const getCategoriesApi = async (token: string, body: any) => {
  try {
    const result = await http.post(
      `/v1/organization/get-categories-ids`,
      body,
      {
        token,
        baseURL: service.ADMIN_SERVICE_URL,
      }
    );
    return result.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unknown error");
  }
};
