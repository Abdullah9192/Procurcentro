import { azureStorageService } from "../utils/general/AzureStorageUtils";

export const extractFilenameFromUrl = (url: string): string => {
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        return filename.replace(/^\d+-/, '');
    } catch (e) {
        return 'unknown-file';
    }
};

export const extractMimeTypeFromUrl = (url: string): string | null => {
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'txt': 'text/plain',
    };

    return extension ? mimeTypes[extension] || null : null;
};


export const deleteAzureFiles = async (files: string | string[]): Promise<void> => {
  const fileList = Array.isArray(files) ? files : [files];

  for (const fileUrl of fileList) {
    try {
      const url = new URL(fileUrl);
      const blobName = decodeURIComponent(url.pathname.replace(/^\/procurecentro\//, ""));
      await azureStorageService.deleteFile(blobName);
    } catch (err) {
      console.error(`Failed to delete file: ${fileUrl}`, err);
    }
  }
};