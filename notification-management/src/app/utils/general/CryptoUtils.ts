import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = "aes-256-cbc";

// Validate and convert key/iv from environment
const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "utf-8");
const iv = Buffer.from(process.env.ENCRYPTION_IV || "", "utf-8");

if (key.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (256 bits)");
}
if (iv.length !== 16) {
  throw new Error("ENCRYPTION_IV must be 16 bytes");
}

/**
 * Encrypt a JSON object or string and return hex string
 */
export const encrypt = (data: any): string => {
  const jsonString = typeof data === "string" ? data : JSON.stringify(data);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

/**
 * Decrypt a hex string to JSON (use for internal testing only)
 */
export const decrypt = (encrypted: string): any => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};
