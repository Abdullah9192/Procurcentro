import { Request, Response, NextFunction } from "express";

export const setUploadFolder = (folder: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    (req as any).uploadFolder = folder;
    next();
  };
};