import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  data: T;
  message?: string;
  statusCode: number;
}

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => ({
        data,
        message: 'Success',
        statusCode: response.statusCode,
      })),
    );
  }
}