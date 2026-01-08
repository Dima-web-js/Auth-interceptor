import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Auth } from './auth';

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshRequest {
  refreshToken?: string;
  expiresInMins?: number;
}

@Injectable({
  providedIn: 'root',
})
export class RefreshAuthSession {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);

  refresh(expiresInMins: number = 30) {
    const refreshToken = this.auth.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body: RefreshRequest = {
      refreshToken,
      expiresInMins,
    };

    return this.http.post<RefreshResponse>('https://dummyjson.com/auth/refresh', body).pipe(
      tap((data) => {
        this.auth.setTokens(data.accessToken, data.refreshToken);
      }),
      catchError((error) => {
        const message = error?.error?.message || error?.message || 'Refresh failed';
        return throwError(() => new Error(message));
      })
    );
  }
}
