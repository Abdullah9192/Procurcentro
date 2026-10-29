import { connectRabbitMQ } from "./Connection";
import { RabbitMessage, QueueName } from "./Types";

export const publishToQueue = async <T>(
  queue: QueueName,
  message: RabbitMessage<T>
) => {
  const channel = await connectRabbitMQ();

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`📤 Published to queue [${queue}]:`, message);
};
