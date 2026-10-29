import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../../config/EnvVariables";

export const generateToken = (payload: object): string =>
  jwt.sign(
    payload,
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions
  );

export const verifyToken = (token: string): any =>
  jwt.verify(token, JWT_SECRET as string);
