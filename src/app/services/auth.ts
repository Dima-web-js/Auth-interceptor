import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

interface LoginRequest {
  username: string;
  password: string;
  expiresInMins?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  readonly accessToken = signal<string | null>(this.getAccessToken());
  readonly refreshToken = signal<string | null>(this.getRefreshToken());

  login(username: string, password: string, expiresInMins: number = 30): Observable<LoginResponse> {
    const body: LoginRequest = {
      username,
      password,
      expiresInMins,
    };

    return this.http.post<LoginResponse>('https://dummyjson.com/auth/login', body).pipe(
      tap((data) => {
        this.setTokens(data.accessToken, data.refreshToken);
      }),
      catchError((error) => {
        const message = error?.error?.message || error?.message || 'Login failed';
        return throwError(() => new Error(message));
      })
    );
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.accessToken.set(accessToken);
    this.refreshToken.set(refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.accessToken.set(null);
    this.refreshToken.set(null);
  }

  logout(): void {
    this.clearTokens();
  }
}
