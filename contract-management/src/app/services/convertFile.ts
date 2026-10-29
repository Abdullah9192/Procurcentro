import axios from "axios";
async function getFileStreamFromUrl(fileUrl: string) {
  const response = await axios.get(fileUrl, {
    responseType: "stream",
  });

  return response.data; // <-- Readable Stream
}
