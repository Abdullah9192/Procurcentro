import { getAllUsers, getUserById } from "../../../respository/users/UserRepository";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";
import { Request, Response } from 'express';



export const fetchAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return successResponse(res, {
      statusCode: 200,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to fetch users',
    });
  }
};

export const fetchUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, { statusCode: 400, message: 'User ID is required' });

    const user = await getUserById(id);
    successResponse(res, {
      statusCode: 200,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (err: any) {
    errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to fetch user',
    });
  }
};