export interface ResponseInterface<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
  path?: string;
}
