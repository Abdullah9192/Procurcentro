
import { Op } from 'sequelize';
import BackofficeNotification from '../../models/backoffice-notification';

// Create Notification
export const createNotification = async (data: any) => {
  const { title, trigger_action, mode, start_date, end_date, time, message } = data;

  if (!title || !trigger_action || !mode) {
    throw { statusCode: 400, message: 'title, trigger_action, and mode are required' };
  }

  const notification = await BackofficeNotification.create({
    title,
    trigger_action,
    mode,
    start_date,
    end_date,
    time,
    message,
  });

  return { notification };
};

// Get All Notifications
export const getAllNotifications = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await BackofficeNotification.findAndCountAll({
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total_records: count,
      total_pages: Math.ceil(count / limit),
      current_page: page,
      per_page: limit,
    },
  };
};


// Get Single Notification
export const getNotificationById = async (id: string) => {
  const notification = await BackofficeNotification.findByPk(id);
  if (!notification) throw { statusCode: 404, message: 'Notification not found' };

  return { notification };
};

// Update Notification
export const updateNotification = async (id: string, data: any) => {
  const notification = await BackofficeNotification.findByPk(id);
  if (!notification) throw { statusCode: 404, message: 'Notification not found' };

  await notification.update(data);
  return { notification };
};

// Delete Notification
export const deleteNotification = async (id: string) => {
  const notification = await BackofficeNotification.findByPk(id);
  if (!notification) throw { statusCode: 404, message: 'Notification not found' };

  await notification.destroy();
  return { deleted_id: id };
};
