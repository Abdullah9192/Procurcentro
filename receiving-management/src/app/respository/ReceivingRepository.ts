import { http } from "../services/AxiosClient";

// executeGetReceivingDetail
export const executeGetReceivingDetail = async (
  id: string,
  token: string,
  user: any
) => {
  try {
    const result = await http.get(`/v1/get-order/${id}`, {
      token,
    });
    return {
      success: true,
      statusCode: 200,
      message: "Success",
      data: result.data,
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 500,
      message: "Failed to get receiving detail.",
      error: err,
    };
  }
};
