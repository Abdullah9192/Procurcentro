import User from "../models/User";

export const generateUserIdNo = async (userType: "admin" | "vendor" | "employee", transaction?: any): Promise<string> => {
  let prefix = "";

  switch (userType) {
    case "admin":
      prefix = "ADM";
      break;
    case "vendor":
      prefix = "VEN";
      break;
    case "employee":
      prefix = "EMP";
      break;
    default:
      throw new Error("Invalid user type");
  }

  // Find the latest user_id_no for this type
  const lastUser = await User.findOne({
    where: { user_type: userType },
    order: [["createdAt", "DESC"]],
    transaction,
  });

  let nextNumber = 1;

  if (lastUser && lastUser.user_id_no) {
    const lastNumber = parseInt(lastUser.user_id_no.split("_")[1], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format as PREFIX_XXX (with leading zeros, e.g., 001, 002)
  const formattedNumber = String(nextNumber).padStart(3, "0");
  return `${prefix}_${formattedNumber}`;
};