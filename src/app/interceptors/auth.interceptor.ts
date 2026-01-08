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
      // Если получили 401 и это не запрос на обновление токена
      if (error.status === 401 && !isRefreshRequest) {

        // Тут хотел при ошибке 401 проверять наличие токенов в localStorage и если нет, 
        // то редиректить на логин, но почему-то меня всегда при обновлении страницы перекидывает на логин(



        // const refreshToken = auth.getRefreshToken();
        // const accessToken = auth.getAccessToken();

        // // Если нет ни одного токена в localStorage - редирект на логин
        // if (!accessToken && !refreshToken) {
        //   auth.logout();
        //   if (router.url !== '/login') {
        //     router.navigate(['/login']);
        //   }
        //   return throwError(() => error);
        // }

        // Если есть refreshToken - пытаемся обновить
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
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

