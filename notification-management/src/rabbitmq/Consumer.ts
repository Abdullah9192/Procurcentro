import { connectRabbitMQ } from "./Connection";
import { RabbitMessage } from "./Types";

type HandlerFunction<T = any> = (data: RabbitMessage<T>) => Promise<void>;

export const consumeQueue = async <T>(
  queue: string,
  handler: HandlerFunction<T>
) => {
  const channel = await connectRabbitMQ(); // ✅ directly get Channel

  await channel.assertQueue(queue, { durable: true });

  channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString()) as RabbitMessage<T>;
        await handler(content);
        channel.ack(msg);
      } catch (error) {
        console.error(
          `❌ Error handling message from queue [${queue}]:`,
          error
        );
        channel.nack(msg, false, false); // Dead-letter or discard
      }
    },
    { noAck: false }
  );

  console.log(`📥 Started consuming queue [${queue}]...`);
};
