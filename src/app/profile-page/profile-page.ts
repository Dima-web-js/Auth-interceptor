import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';
import { GetAuthUser, User } from '../services/get-auth-user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly auth = inject(Auth);
  private readonly getUser = inject(GetAuthUser);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.getUser.getUser().subscribe({
      next: (userData) => {
        this.user.set(userData);
      },
      error: (err) => {
        this.error.set(err instanceof Error ? err.message : 'Failed to load user');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

