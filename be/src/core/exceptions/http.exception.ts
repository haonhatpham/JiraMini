import { HttpStatusType } from '@/core/http/http-status.js';

export class HttpException extends Error {
  public readonly status: HttpStatusType;
  public readonly code: string;
  public readonly expose: boolean;

  constructor(status: HttpStatusType, code: string, message: string, expose = true) {
    super(message);
    this.status = status;
    this.code = code;
    this.expose = expose;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}
