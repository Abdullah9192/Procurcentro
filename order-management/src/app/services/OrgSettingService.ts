import { service } from "../../config/EnvVariables";
import PurchaseOrder from "../models/Order";
import OrderSupplierItem from "../models/OrderSupplierItem";
import { http } from "./AxiosClient";
import dayjs from "dayjs";

export const generateOrderId = async (
  organization_id: string,
  token: string
): Promise<string> => {
  const response = await http.get(
    `/v1/organization/modules?type=purchase_orders`,
    undefined,
    {
      token,
      baseURL: service.ADMIN_SERVICE_URL,
    }
  );

  const module = response?.data?.data?.data?.[0];

  if (!module) {
    return "PO/001";
  }

  const settings = module?.settings || {};
  const customize = settings?.customize_purchaseOrder_id === true;
  const prefix = customize && settings?.prefix ? settings.prefix : "";
  const suffix = customize && settings?.suffix ? settings.suffix : "";

  // Step 1: Get latest requisition
  const latestOrder = await PurchaseOrder.findOne({
    where: { organization_id },
    order: [["created_at", "DESC"]],
  });

  let lastNumber = 0;

  if (latestOrder?.order_gen_id) {
    const match = latestOrder.order_gen_id.match(/\d+/); // Match first number group
    if (match) {
      lastNumber = parseInt(match[0], 10); // Convert to number
    }
  }

  const newNumber = String(lastNumber + 1).padStart(3, "0");

  // Step 2: Compose new request_id
  let order_id = "";

  if (customize) {
    if (prefix && suffix) {
      order_id = `${prefix}/${newNumber}/${suffix}`;
    } else if (prefix) {
      order_id = `${prefix}/${newNumber}`;
    } else if (suffix) {
      order_id = `${newNumber}/${suffix}`;
    } else {
      order_id = newNumber;
    }
  } else {
    order_id = newNumber;
  }

  return order_id;
};


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
  const latestInvoice = await OrderSupplierItem.findOne({
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