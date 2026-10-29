import { connectRabbitMQ } from "./Connection";
import { RabbitMessage} from "./Types";

export const publishToQueue = async <T>(
  queue: string,
  message: RabbitMessage<T>
) => {
  const channel = await connectRabbitMQ();
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`📤 Published to queue [${queue}]:`, message);
};
