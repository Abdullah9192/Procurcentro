import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";
import { executeGetSupplierBankInfo, executeGetSupplierBasicInfo, executeGetSupplierClientReferences, executeGetSupplierContacts, executeGetSupplierKycInfo } from "../setup/SetupRepository";

interface RegisterDTO {
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export const executeRegister = async ({ email, password }: RegisterDTO) => {
  try {
    const response = await http.post(
      "/v1/auth/vendor-register",
      { email, password },
      {
        baseURL: service.ADMIN_SERVICE_URL || "http://admin-service:5001",
      }
    );

    if (!response.success) {
      return {
        success: false,
        statusCode: response.statusCode,
        message: response.error.message,
        error: response.error,
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "The supplier registered successfully.",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Internal error while registering via admin service.",
      error: error?.message || error,
    };
  }
};

export const executeLogin = async (
  { email, password }: LoginDTO
) => {
  try {
    const result = await http.post(
      "/v1/auth/vendor-login",
      { email, password },
      {
        baseURL: service.ADMIN_SERVICE_URL,
      }
    );
    if (!result.success) {
      return {
        success: false,
        statusCode: result.statusCode,
        message: result.error.message,
        error: result.error,
      };
    }
    return {
      success: true,
      statusCode: 200,
      message: "Login successful.",
      data: result.data,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      message: "Login failed",
      error: err,
    };
  }
};

export const executeVendorDetail = async (
  token: any,
  requestData: any,
) => {
  console.log("Executing vendor detail with requestData:", requestData);
  return {
    success: true,
    statusCode: 200,
    message: "The supplier data retrieved successfully.",
    data: requestData,
  };
  // try {
  //   console.log("Executing vendor detail with requestData:", requestData);
  //   if (!requestData?.user_id || !requestData?.organization_id) {
  //     return {
  //       success: false,
  //       statusCode: 404,
  //       message: "Organization id or supplier id is missing",
  //     };
  //   }
  //   const result = await http.get(
  //     "/v1/auth/get-vendor-detail",
  //     { organization_id: requestData?.organization_id, user_id: requestData?.user_id },
  //     {
  //       baseURL: service.ADMIN_SERVICE_URL,
  //       token,
  //     }
  //   );

  //   if (!result.success) {
  //     return {
  //       success: false,
  //       statusCode: result.statusCode,
  //       message: result.error.message,
  //       error: result.error,
  //     };
  //   }
  //   const { password, ...safeUserData } = result?.data?.data || {};

  //   const userData = safeUserData;
  //   if (!userData?.organization_id || !userData?.id) {
  //     return {
  //       success: false,
  //       statusCode: 400,
  //       message: "Missing required user data (organization_id or id)",
  //       error: "Invalid user data structure",
  //     };
  //   }

  //   const [
  //     basicInfo,
  //     bankInfo,
  //     kycInfo,
  //     contacts,
  //     clientReferences
  //   ] = await Promise.all([
  //     executeGetSupplierBasicInfo(userData),
  //     executeGetSupplierBankInfo(userData),
  //     executeGetSupplierKycInfo(userData),
  //     executeGetSupplierContacts(userData),
  //     executeGetSupplierClientReferences(userData)
  //   ]);

  //   if (!basicInfo.success || !bankInfo.success || !kycInfo.success ||
  //     !contacts.success || !clientReferences.success) {

  //     const failedOperation = [
  //       { name: 'basicInfo', result: basicInfo },
  //       { name: 'bankInfo', result: bankInfo },
  //       { name: 'kycInfo', result: kycInfo },
  //       { name: 'contacts', result: contacts },
  //       { name: 'clientReferences', result: clientReferences }
  //     ].find(op => !op.result.success);

  //     return {
  //       success: false,
  //       statusCode: failedOperation?.result.statusCode || 500,
  //       message: `Failed to retrieve ${failedOperation?.name}: ${failedOperation?.result.message}`,
  //     };
  //   }

  //   const aggregatedData = {
  //     user: safeUserData,
  //     basicInfo: basicInfo.data,
  //     bankInfo: bankInfo.data,
  //     kycInfo: kycInfo.data,
  //     contacts: contacts.data,
  //     clientReferences: clientReferences.data
  //   };

  //   return {
  //     success: true,
  //     statusCode: 200,
  //     message: "Vendor details retrieved successfully.",
  //     data: aggregatedData,
  //   };

  // } catch (err: any) {

  //   return {
  //     success: false,
  //     statusCode: 500,
  //     message: "Failed to retrieve vendor details",
  //     error: err,
  //   };
  // }
};

export const executeGetUserByEmailApi = async (email: string) => {
  try {
    const response = await http.get(
      `admin/v1/auth/get-user-email/${email}`,
      undefined,
      {
        baseURL: service.ADMIN_SERVICE_URL, // ✅ apni Auth service ki base URL
      }
    );

    return {
      success: true,
      statusCode: (response as any).status,
      message: response.data?.message || "User fetched successfully",
      data: response.data?.data,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: error?.response?.status || 500,
      message:
        error?.response?.data?.message ||
        "Sorry, you don’t already exist in any organization.",
    };
  }
};

export const executeUpdateUserGoogleId = async (userId: string, googleId: string,
  tokens?: { googleAccessToken?: string; googleRefreshToken?: string }) => {
  try {
    const payload = {
      google_id: googleId,
      ...(tokens?.googleAccessToken && { googleAccessToken: tokens.googleAccessToken }),
      ...(tokens?.googleRefreshToken && { googleRefreshToken: tokens.googleRefreshToken }),
    };
const response = await http.put(
  `admin/v1/auth/update-user/${userId}`,
  { google_id: googleId },
  {
    baseURL: service.ADMIN_SERVICE_URL,
  }
);

return {
  success: true,
  statusCode: (response as any).status,
  message: response.data?.message || "User updated successfully",
  data: response.data?.data,
};
  } catch (error: any) {
  return {
    success: false,
    statusCode: error?.response?.status || 500,
    message: error?.response?.data?.message || "Failed to update google_id",
  };
}
};

export const executeUpdateUserMicrosoftId = async (userId: string, microsoftId: string) => {
  try {
    const response = await http.put(
      `admin/v1/auth/update-user/${userId}`,
      { microsoft_id: microsoftId },
      {
        baseURL: service.ADMIN_SERVICE_URL,
      }
    );

    return {
      success: true,
      statusCode: (response as any).status,
      message: response.data?.message || "User updated successfully",
      data: response.data?.data,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: error?.response?.status || 500,
      message: error?.response?.data?.message || "Failed to update google_id",
    };
  }
};