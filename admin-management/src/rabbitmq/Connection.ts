import amqp, { Channel } from 'amqplib';
import { RABBITMQ_URL } from '../config/EnvVariables';

let channel: Channel | undefined;

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel; // ✅ Reuse existing channel

  try {
    const connection = await amqp.connect(RABBITMQ_URL); // ✅ Connect once
    channel = await connection.createChannel();           // ✅ Create a channel
    console.log('[RabbitMQ] Connected');
    return channel;
  } catch (err) {
    console.error('RabbitMQ connection failed:', err);
    throw err;
  }
};
