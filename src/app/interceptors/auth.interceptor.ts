import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { RefreshAuthSession } from '../services/refresh-auth-session';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const refreshAuthSession = inject(RefreshAuthSession);
  const router = inject(Router);

  // Исключаем запросы аутентификации и обновления токена
  const isAuthRequest = req.url.includes('/auth/login');
  const isRefreshRequest = req.url.includes('/auth/refresh');

  if (isAuthRequest || isRefreshRequest) {
    return next(req);
  }

  // Добавляем токен в заголовки
  const accessToken = auth.getAccessToken();
  let clonedReq = req;
  
  if (accessToken) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Если получили 401 и это не запрос на обновление токена, пытаемся обновить
      if (error.status === 401 && !isRefreshRequest && accessToken) {
        return refreshAuthSession.refresh().pipe(
          switchMap(() => {
            // Повторяем запрос с новым токеном
            const newToken = auth.getAccessToken();
            if (newToken) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(retryReq);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            // Если обновление не удалось, очищаем токены и редиректим на логин
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

