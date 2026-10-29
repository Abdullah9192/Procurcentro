import { service } from "../../config/EnvVariables";
import Requisition from "../models/Requisition";
import { http } from "./AxiosClient";

export const generateRequestId = async (
  organization_id: string,
  token: string
): Promise<string> => {
  let customize = false;
  let prefix = "";
  let suffix = "";

  try {
    const response = await http.get(
      `/v1/organization/modules?type=purchase_requisition`,
      undefined,
      {
        token,
        baseURL: service.ADMIN_SERVICE_URL,
      }
    );

    const module = response?.data?.data?.data?.[0];

    if (module) {
      const settings = module?.settings || {};
      customize = settings?.customize_requisition_id === true;
      prefix = customize && settings?.prefix ? settings.prefix : "";
      suffix = customize && settings?.suffix ? settings.suffix : "";
    }
  } catch (error) {
    console.warn("Failed to fetch module settings:", error);
  }

  // Step 1: Get latest requisition
  const latestRequisition = await Requisition.findOne({
    where: { organization_id },
    order: [["created_at", "DESC"]],
  });


  let lastNumber = 0;

  if (latestRequisition?.request_id) {
    const match = latestRequisition.request_id.match(/\d+/);
    if (match) {
      lastNumber = parseInt(match[0], 10);
    }
  }

  const newNumber = String(lastNumber + 1).padStart(3, "0");

  // Step 2: Compose request_id
  let request_id = "";

  if (customize) {
    if (prefix && suffix) {
      request_id = `${prefix}/${newNumber}/${suffix}`;
    } else if (prefix) {
      request_id = `${prefix}/${newNumber}`;
    } else if (suffix) {
      request_id = `${newNumber}/${suffix}`;
    } else {
      request_id = newNumber;
    }
  } else {
    request_id = `REQ/${newNumber}`;
  }

  return request_id;
};
