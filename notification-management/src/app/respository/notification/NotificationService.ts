import Notification from "../../model/notification.model";
import { emitNotification } from "../../../sockets/socket";
import AppDataSource from "../../../config/DatabaseSource";
import { QueryTypes } from "sequelize";
import { publishToQueue } from "../../../rabbitmq/Producer";
import { RBT_VENDOR_QUEUES } from "../../../rabbitmq/Queues";
import { vendorEvents } from "../../../rabbitmq/Events";

export const create = async (payload: {
  sender_id: string;
  receiver_id: string;
  organization_id: string;
  subsidiary_id?: string | null;
  notification_type: string;
  notification_module: string;
  message: string;
}) => {
  try {
    const notification = await Notification.create(payload);
    emitNotification(notification.receiver_id, notification);
    return notification;
  } catch (error: any) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

export const getByReceiver = async (
  receiver_id: string,
  page: number,
  limit: number
) => {
  try {
    const offset = (page - 1) * limit;

    const rows = await AppDataSource.query(
      `
  SELECT 
    n.*,
    COALESCE(u_sender.name, bu_sender.full_name) AS sender_name,
    COALESCE(u_sender.user_id_no, bu_sender.user_id) AS sender_user_id,
    COALESCE(u_receiver.name, bu_receiver.full_name) AS receiver_name,
    COALESCE(u_receiver.user_id_no, bu_receiver.user_id) AS receiver_user_id
  FROM notifications n
  LEFT JOIN users u_sender ON u_sender.id = n.sender_id
  LEFT JOIN backoffice_users bu_sender ON bu_sender.id = n.sender_id
  LEFT JOIN users u_receiver ON u_receiver.id = n.receiver_id
  LEFT JOIN backoffice_users bu_receiver ON bu_receiver.id = n.receiver_id
  WHERE n.receiver_id = :receiverId
  ORDER BY n.created_at DESC
  LIMIT :limit OFFSET :offset
  `,
      {
        replacements: {
          receiverId: receiver_id,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      }
    );

    const totalResult = await AppDataSource.query(
      `
  SELECT COUNT(*)::int AS total
  FROM notifications
  WHERE receiver_id = :receiverId
  `,
      {
        replacements: { receiverId: receiver_id },
        type: QueryTypes.SELECT,
      }
    ) as { total: number }[];


    return {
      total: totalResult[0]?.total || 0,
      page,
      limit,
      data: rows,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
};

export const markAsRead = async (id: string) => {
  try {
    const notification = await Notification.findByPk(id);

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.is_read = true;
    await notification.save();

    return notification;
  } catch (error: any) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
};

export const executeSendPurchaseOrderContractEmail =async (payload: {
    emails: string[];
    receiver_name?: string;
    sender_name?: string;
    purchase_order_name?: string;
    organization_name?: string;
    vendor_name?: string;
    notes?: string;
  }) => {
    const {
      emails,
      receiver_name,
      sender_name,
      purchase_order_name,
      organization_name,
      vendor_name,
      notes,
    } = payload;

    for (const email of emails) {
      await publishToQueue(
        RBT_VENDOR_QUEUES.PURCHASE_ORDER_CONTRACT_QUEUE,
        {
          event:
            vendorEvents.send_purchase_order_contract_email,
          data: {
            email,
            receiver_name,
            sender_name,
            purchase_order_name,
            organization_name,
            vendor_name,
            notes,
          },
        }
      );
    }

    return {
      success: true,
      statusCode: 200,
      message:
        "Purchase order contract emails queued successfully.",
    };
  };


