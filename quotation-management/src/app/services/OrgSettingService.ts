import { service } from "../../config/EnvVariables";
import Quotation from "../models/Quotation";
import { http } from "./AxiosClient";

export const generateQuotationId = async (
  organization_id: string,
  token: string
): Promise<string> => {
  // 1️⃣ Fetch module for settings (if exists)
  const response = await http.get(
    `/v1/organization/modules?type=quotations`,
    undefined,
    {
      token,
      baseURL: service.ADMIN_SERVICE_URL,
    }
  );

  const module = response?.data?.data?.data?.[0];
  const settings = module?.settings || {};
  const customize = settings?.customize_quotation_id === true;
  const prefix = customize && settings?.prefix ? settings.prefix : "";
  const suffix = customize && settings?.suffix ? settings.suffix : "";

  // 2️⃣ Find latest quotation from DB (for incrementing)
  const latestQuotation = await Quotation.findOne({
    where: { organization_id },
    order: [["created_at", "DESC"]],
  });

  let lastNumber = 0;

  if (latestQuotation?.quote_id) {
    const match = latestQuotation.quote_id.match(/\d+/); // extract digits
    if (match) {
      lastNumber = parseInt(match[0], 10);
    }
  }

  const newNumber = String(lastNumber + 1).padStart(3, "0");

  // 3️⃣ Compose new quotation_id
  let quote_id = "";

  if (customize) {
    if (prefix && suffix) {
      quote_id = `${prefix}/${newNumber}/${suffix}`;
    } else if (prefix) {
      quote_id = `${prefix}/${newNumber}`;
    } else if (suffix) {
      quote_id = `${newNumber}/${suffix}`;
    } else {
      quote_id = newNumber;
    }
  } else {
    // default pattern if no module or no customization
    quote_id = `QUO/${newNumber}`;
  }

  return quote_id;
};

