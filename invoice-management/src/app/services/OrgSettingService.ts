import dayjs from "dayjs";
import { service } from "../../config/EnvVariables";
import Invoice from "../models/Invoice";
import { http } from "./AxiosClient";

export const generateInvoiceId = async (
  organization_id: string,
  token: string
): Promise<string> => {
  const response = await http.get(
    `/v1/organization/modules?type=invoice`,
    undefined,
    {
      token,
      baseURL: service.ADMIN_SERVICE_URL,
    }
  );

  const module = response?.data?.data?.data?.[0];

  if (!module) {
    return "INV/001";
  }

  const settings = module?.settings || {};
  const customize = settings?.customize_invoice_number === true;
  const format: string = customize && settings?.purchase_order_id_format
    ? settings.purchase_order_id_format
    : "";

  // Step 1: Get latest invoice
  const latestInvoice = await Invoice.findOne({
    where: { organization_id },
    order: [["created_at", "DESC"]],
  });

  let lastNumber = 0;

  if (latestInvoice?.invoice_id) {
    const match = latestInvoice.invoice_id.match(/(\d{3,})$/); // match trailing 3+ digit number
    if (match) {
      lastNumber = parseInt(match[1], 10);
    }
  }

  const newNumber = String(lastNumber + 1).padStart(3, "0");

  // Step 2: Compose new invoice_id
  let invoice_id = "";

  if (customize && format) {
    const now = dayjs();
    const datePart =
      format === "MM/YYYY"
        ? now.format("MM/YYYY")
        : format === "YYYY/MM"
        ? now.format("YYYY/MM")
        : ""; // fallback

    invoice_id = `INV/${datePart}/${newNumber}`;
  } else {
    invoice_id = `INV/${newNumber}`;
  }

  return invoice_id;
};
