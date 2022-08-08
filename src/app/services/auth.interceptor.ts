import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { catchError, tap, throwError } from 'rxjs';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) { } intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (!request.url.includes('login')) {
      request = request.clone({
        withCredentials: true,
        setHeaders: {
          // Authorization: `Bearer 2121212232323232`,
        },
      });
    }
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.status === 200) {
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.toastr.error('Some error occured in api calling');
        return throwError(error);
      })
    );
  }
}