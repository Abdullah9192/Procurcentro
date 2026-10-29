export interface RabbitMessage<T = any> {
  event: string;
  data: T;
}

export type QueueName = 'user.created' | 'email.send' | 'order.placed';
