import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import Busboy from "busboy";
import { Request } from "express";
import { azureConfig } from "../../../config/AzureBlob";
import { PassThrough } from "stream";

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ReturnType<BlobServiceClient["getContainerClient"]>;

  constructor() {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      azureConfig.connectionString
    );
    this.containerClient = this.blobServiceClient.getContainerClient(
      azureConfig.containerName
    );
  }

  // Initialize container (call this once at app startup)
  public async initialize(): Promise<void> {
    await this.containerClient.createIfNotExists();
    console.log(`Azure container "${azureConfig.containerName}" is ready`);
  }

  // Handle file upload directly from Busboy
  public async uploadFromBusboy(req: Request): Promise<UploadResult[]> {
    return new Promise((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });
      const uploadResults: UploadResult[] = [];
      const uploadPromises: Promise<UploadResult>[] = [];

      busboy.on("file", (fieldname, file, info) => {
        const { filename, mimeType } = info;
        if (!filename) {
          file.resume(); // Drain the file if no filename
          return;
        }

        const uploadPromise = this.uploadStream(filename, file, mimeType)
          .then((result) => {
            uploadResults.push(result);
            return result;
          })
          .catch((error) => {
            throw error;
          });

        uploadPromises.push(uploadPromise);
      });

      busboy.on("error", (error) => {
        reject(error);
      });

      busboy.on("finish", async () => {
        try {
          await Promise.all(uploadPromises);
          resolve(uploadResults);
        } catch (error) {
          reject(error);
        }
      });

      req.pipe(busboy);
    });
  }

  public async uploadStream(
    blobName: string,
    stream: NodeJS.ReadableStream,
    contentType: string
  ): Promise<UploadResult> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    const passThrough = new PassThrough();
    stream.pipe(passThrough);

    await blockBlobClient.uploadStream(
      passThrough,
      4 * 1024 * 1024, // bufferSize: 4MB
      5,
      { blobHTTPHeaders: { blobContentType: contentType } }
    );

    return {
      filename: blobName,
      url: blockBlobClient.url,
      contentType,
      size: (await blockBlobClient.getProperties()).contentLength || 0,
    };
  }

  // Additional methods (similar to previous implementation)
  public async deleteFile(blobName: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  public async listFiles(): Promise<string[]> {
    const blobs: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat()) {
      blobs.push(blob.name);
    }
    return blobs;
  }

  public async downloadFile(blobName: string): Promise<NodeJS.ReadableStream> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Verify blob exists first
      if (!(await blockBlobClient.exists())) {
        throw new Error(`Blob ${blobName} not found`);
      }

      const downloadResponse = await blockBlobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error(`Download stream not available for blob ${blobName}`);
      }

      return downloadResponse.readableStreamBody;
    } catch (error) {
      throw new Error(
        `Failed to download ${blobName}: ${error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

interface UploadResult {
  filename: string;
  url: string;
  contentType: string;
  size: number;
}

// Singleton instance
export const azureStorageService = new AzureStorageService();
