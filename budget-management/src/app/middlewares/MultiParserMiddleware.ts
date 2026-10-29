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

  busboy.on("field", (name, value) => {
    if (name === "folderName") {
      folderName = value;
    } else {
      setNestedValue(body, name, value);
    }
  });

  busboy.on("file", (fieldName, fileStream, info) => {
    const { filename, mimeType } = info;
    if (!filename) return fileStream.resume();

    const blobName = `${folderName}/${Date.now()}-${filename}`;

    const uploadPromise = azureStorageService
      .uploadStream(blobName, fileStream, mimeType)
      .then(({ url }) => {
        setNestedValue(body, fieldName, url, true);
      });

    pendingUploads.push(uploadPromise);
  });

  busboy.on("error", next);

  busboy.on("finish", async () => {
    try {
      await Promise.all(pendingUploads);

      normalizeAllNestedArrays(body);

      req.body = body;
      next();
    } catch (err) {
      next(err);
    }
  });

  req.pipe(busboy);
};

/**
 * Utility to set nested fields like: items[0][name], items[0][files][]
 */
function setNestedValue(obj: any, path: string, value: any, isFile = false) {
  // Detect and strip '[]' from path if present (used for arrays)
  const isArrayPush = path.endsWith("[]");
  if (isArrayPush) {
    path = path.slice(0, -2);
  }

  const keys = path
    .replace(/\]/g, "")
    .split("[")
    .map((k) => (isNaN(Number(k)) ? k : Number(k)));

  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const isLast = i === keys.length - 1;

    if (isLast) {
      if (isArrayPush) {
        if (!Array.isArray(current[key])) {
          current[key] = [];
        }
        current[key].push(value);
      } else if (isFile) {
        // if not using [], and is file, assign directly
        current[key] = value;
      } else {
        current[key] = value;
      }
    } else {
      if (typeof nextKey === "number") {
        if (!Array.isArray(current[key])) {
          current[key] = [];
        }
      } else {
        if (!current[key] || typeof current[key] !== "object") {
          current[key] = {};
        }
      }

      current = current[key];
    }
  }
}



/**
 * Recursively converts all objects with numeric keys (e.g., { '0': {...}, '1': {...} }) into arrays
 */
function normalizeAllNestedArrays(obj: any): void {
  for (const key in obj) {
    if (
      obj[key] &&
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key])
    ) {
      const keys = Object.keys(obj[key]);

      // check if all keys are numeric → then convert to array
      if (keys.every((k) => !isNaN(Number(k)))) {
        obj[key] = Object.values(obj[key]);
      } else {
        normalizeAllNestedArrays(obj[key]); // Recurse deeper
      }
    }
  }
}
