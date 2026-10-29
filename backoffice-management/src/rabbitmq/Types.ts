export interface RabbitMessage<T = any> {
  event: string;
  data: T;
}

