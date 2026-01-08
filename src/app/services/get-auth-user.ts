import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class GetAuthUser {
  private readonly http = inject(HttpClient);

  getUser(): Observable<User> {
    return this.http.get<User>('https://dummyjson.com/auth/me').pipe(
      catchError((error) => {
        const message = error?.error?.message || error?.message || 'Failed to get user';
        return throwError(() => new Error(message));
      })
    );
  }
}
