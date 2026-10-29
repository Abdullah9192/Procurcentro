import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

type UploadOptions = {
  folder?: string;
  allowedFormats: string[];
  maxSizeMB?: number;
  useDisk?: boolean; // Flag to choose between disk and cloud
};

export const createMulterUploader = ({
  folder = 'uploads',
  allowedFormats,
  maxSizeMB = 10,
  useDisk = false,
}: UploadOptions) => {
  let storage;

  if (useDisk) {
    const dir = path.join(__dirname, `../../public/${folder}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });
  }

  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const extname = allowedFormats.some(format =>
      path.extname(file.originalname).toLowerCase().includes(format)
    );
    const mimetype = allowedFormats.some(format =>
      file.mimetype.toLowerCase().includes(format)
    );

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error(`Only [${allowedFormats.join(', ')}] files are allowed!`));
    }
  };

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter,
  });
};
