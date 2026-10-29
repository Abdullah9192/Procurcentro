import { Request, Response } from 'express';
import { createNotification, deleteNotification, getAllNotifications, getNotificationById, updateNotification } from '../../../respository/notification/notification';
import { errorResponse, successResponse } from '../../../utils/general/ResponseUtils';


// Create Notification
export const createNotificationController = async (req: Request, res: Response) => {
  try {
    const result = await createNotification(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Notification created successfully',
      data: result.notification,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to create notification',
    });
  }
};

// Get All Notifications
export const getAllNotificationsController = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllNotifications(page, limit);

    return successResponse(res, {
      statusCode: 200,
      message: 'Notifications fetched successfully',
      data: result.notifications,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to fetch notifications',
    });
  }
};


// Get Single Notification
export const getNotificationByIdController = async (req: Request, res: Response) => {
  try {
    const result = await getNotificationById(req.params.id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Notification fetched successfully',
      data: result.notification,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to fetch notification',
    });
  }
};

// Update Notification
export const updateNotificationController = async (req: Request, res: Response) => {
  try {
    const result = await updateNotification(req.params.id, req.body);
    return successResponse(res, {
      statusCode: 200,
      message: 'Notification updated successfully',
      data: result.notification,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to update notification',
    });
  }
};

// Delete Notification
export const deleteNotificationController = async (req: Request, res: Response) => {
  try {
    const result = await deleteNotification(req.params.id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Notification deleted successfully',
      data: result,
    });
  } catch (err: any) {
    return errorResponse(res, {
      statusCode: err.statusCode || 500,
      message: err.message || 'Failed to delete notification',
    });
  }
};
