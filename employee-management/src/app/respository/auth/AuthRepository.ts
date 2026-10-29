import { Transaction } from "sequelize";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/general/JwtUtils";
import { http } from "../../services/AxiosClient";
import { service } from "../../../config/EnvVariables";

interface LoginDTO {
  email: string;
  password: string;
}
// ========  Register User :
export const executeRegister = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await http.post(
      "/v1/auth/employee-register",
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
      message: "The employee registered successfully.",
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

// ======== Login User :
export const executeLogin = async (
  { email, password }: LoginDTO
) => {
  try {
    const result = await http.post(
      "/v1/auth/employee-login",
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

// ==== get employee list
// export const executeGetEmployeeList = async (
//   organization_id: string
// ): Promise<any> => {
//   const employeeList = await User.findAll({
//     where: { organization_id },
//   });
//   return {
//     success: true,
//     statusCode: 200,
//     message: "Employee list fetched successfully.",
//     data: employeeList,
//   };
// };


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

export const executeUpdateUserGoogleId = async (userId: string, googleId: string) => {
  try {
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

