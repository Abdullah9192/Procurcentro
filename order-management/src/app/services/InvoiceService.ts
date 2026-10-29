import OrderInvoice from "../models/OrderReceiving";

export const generateInvoiceNo = async (): Promise<string> => {
  try {
    // Find the latest invoice by creation time or ID
    const lastInvoice = await OrderInvoice.findOne({
      order: [["created_at", "DESC"]],
      attributes: ["invoice_gen_id "],
    });

    let newNumber = 1;

    if (lastInvoice && lastInvoice.invoice_gen_id ) {
      // Match numeric part from the pattern: PO/001/ADE
      const match = lastInvoice.invoice_gen_id .match(/PO\/(\d+)\/ADE/);
      if (match && match[1]) {
        newNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Pad number with zeros (001, 002, 010, etc.)
    const paddedNumber = String(newNumber).padStart(3, "0");

    // Construct new invoice ID
    const newInvoiceId = `PO/${paddedNumber}/ADE`;

    return newInvoiceId;
  } catch (error) {
    console.error("Error generating Invoice No:", error);
    // fallback to random if something goes wrong
    const fallback = `PO/${Math.floor(100 + Math.random() * 900)}/ADE`;
    return fallback;
  }
};
