import { OrderReceiving } from "../models/OrderReceiving";
export const generateGRNId = async (): Promise<string> => {
  try {
    // Find latest GRN based on creation time or id
    const lastGRN = await OrderReceiving.findOne({
      order: [["created_at", "DESC"]],
      attributes: ["grn_id"],
    });

    let newNumber = 1;

    if (lastGRN && lastGRN.grn_gen_id) {
      // Extract numeric part (e.g., GRN-0009 -> 9)
      const match = lastGRN.grn_gen_id.match(/GRN-(\d+)/);
      if (match && match[1]) {
        newNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Pad with zeros (e.g., 1 -> 0001)
    const paddedNumber = String(newNumber).padStart(4, "0");
    const newGRNId = `GRN-${paddedNumber}`;

    return newGRNId;
  } catch (error) {
    console.error("Error generating GRN ID:", error);
    // fallback to random if something goes wrong
    const fallback = `GRN-${Math.floor(1000 + Math.random() * 9000)}`;
    return fallback;
  }
};
