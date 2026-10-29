import { Request, Response } from "express";
import { azureStorageService } from "../utils/azure/AzureStorageUtil";
import { errorResponse, successResponse } from "../utils/general/ResponseUtils";
export const deleteAzureFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fileUrl = req.query.fileUrl as string;

    if (!fileUrl) {
      res.status(400).json({ message: "fileUrl is required as query param." });
    }

    const url = new URL(fileUrl);
    const blobName = decodeURIComponent(
      url.pathname.replace(/^\/procurecentro\//, "")
    );

    await azureStorageService.deleteFile(blobName);

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
  }
};


export const uploadAzureFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileUrl = req.body?.file;

  if (!fileUrl) {
    errorResponse(res, {
      statusCode: 400,
      message: "No file provided.",
    });
    return;
  }

  try {
    successResponse(res, {
      statusCode: 200,
      message: "File uploaded successfully.",
      data: fileUrl,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload file.",
      error: err,
    });
  }
};


export const uploadMultipleAzureFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = req.body?.files;

  if (!Array.isArray(files) || files.length === 0) {
    errorResponse(res, {
      statusCode: 400,
      message: "No files provided.",
    });
    return;
  }

  try {
    successResponse(res, {
      statusCode: 200,
      message: "Files uploaded successfully.",
      data: files, // file URLs
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: 500,
      message: "Failed to upload files.",
      error: err.message,
    });
  }
};

export const deleteMultipleAzureFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fileUrls: string[] = req.body?.fileUrls;

  if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
    res.status(400).json({ message: "fileUrls array is required in body." });
    return;
  }

  const results = {
    deleted: [] as string[],
    failed: [] as { url: string; error: string }[],
  };

  for (const fileUrl of fileUrls) {
    try {
      const url = new URL(fileUrl);
      const blobName = decodeURIComponent(
        url.pathname.replace(/^\/procurecentro\//, "")
      );
      await azureStorageService.deleteFile(blobName);
      results.deleted.push(fileUrl);
    } catch (err: any) {
      results.failed.push({ url: fileUrl, error: err.message });
    }
  }

  res.status(200).json({
    message: "Bulk file deletion completed.",
    ...results,
  });
};

