import { Request, Response, NextFunction } from "express";
import Busboy from "busboy";
import { azureStorageService } from "../utils/general/AzureStorageUtils";

export const multipartParser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return next();
  }

  const busboy = Busboy({ headers: req.headers });
  const body: Record<string, any> = {};
  const pendingUploads: Promise<void>[] = [];
  let folderName = (req as any).uploadFolder || "uploads";

  // Handle text fields
  busboy.on("field", (name, value) => {
    body[name] = value;
  });

  // Handle file fields
  busboy.on("file", (fieldName, fileStream, info) => {
    const { filename, mimeType } = info;
    if (!filename) return fileStream.resume();

    // Normalize field name: remove trailing "[]"
    fieldName = fieldName.replace(/\[\]$/, '');

    const blobName = `${folderName}/${Date.now()}-${filename}`;

    const uploadPromise = azureStorageService
      .uploadStream(blobName, fileStream, mimeType)
      .then(({ url }) => {
        if (body[fieldName]) {
          if (Array.isArray(body[fieldName])) {
            body[fieldName].push(url);
          } else {
            body[fieldName] = [body[fieldName], url];
          }
        } else {
          body[fieldName] = url;
        }
      });

    pendingUploads.push(uploadPromise);
  });

  busboy.on("error", next);

  busboy.on("finish", async () => {
    try {
      await Promise.all(pendingUploads);
      req.body = body;
      next();
    } catch (err) {
      next(err);
    }
  });

  req.pipe(busboy);
};
