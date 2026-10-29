import { Request, Response } from "express";
import * as notificationService from "../../../respository/notification/NotificationService";
import { errorResponse, successResponse } from "../../../utils/general/ResponseUtils";
import { purchaseOrderContractEmailValidation } from "../../validators/AuthValidation";

// notification without grpc
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = await notificationService.create(req.body);
  res.status(201).json(data);
};

export const getNotificationsByReceiver = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { receiver_id } = req.params;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!receiver_id) {
    res.status(400).json({ message: "receiver_id is required" });
    return;
  }

  if (isNaN(page) || isNaN(limit)) {
    res.status(400).json({ message: "Invalid pagination values" });
    return;
  }

  const data = await notificationService.getByReceiver(
    receiver_id,
    page,
    limit
  );

  res.status(200).json(data);
};

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const data = await notificationService.markAsRead(id);

  res.status(200).json(data);
};

export const sendPurchaseOrderContractEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { error } =
    purchaseOrderContractEmailValidation.validate(
      req.body
    );

  if (error) {
    errorResponse(res, {
      statusCode: 400,
      message: error.details[0].message,
    });
    return;
  }

  try {
    const result =
      await notificationService.executeSendPurchaseOrderContractEmail(
        req.body
      );

    if (!result.success) {
      errorResponse(res, {
        statusCode: result.statusCode,
        message: result.message,
      });
      return;
    }

    successResponse(res, {
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (error: any) {
    errorResponse(res, {
      statusCode: 500,
      message:
        error?.message ||
        "Failed to send purchase order contract email.",
    });
  }
};