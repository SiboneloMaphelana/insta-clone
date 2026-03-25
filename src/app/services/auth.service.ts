import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { User } from '../models/user.model';
import { API_BASE_URL } from '../core/api.config';
import { getUserFacingErrorMessage } from '../core/http-error.util';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${API_BASE_URL}/users`;
  private readonly sessionKey = 'currentUser';

  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string): Observable<AuthResult> {
    const cleanName = name.trim();
    const cleanEmail = this.normalizeEmail(email);

    return this.http
      .get<User[]>(`${this.baseUrl}?email=${encodeURIComponent(cleanEmail)}`)
      .pipe(
        switchMap((emailMatches) => {
          if (emailMatches.length > 0) {
            return of({
              success: false,
              message:
                'An account with that email already exists. Try logging in instead.',
            });
          }

          return this.http.get<User[]>(this.baseUrl).pipe(
            switchMap((users) => {
              const username = this.buildUniqueUsername(
                cleanName,
                cleanEmail,
                users
              );
              const newUser: Omit<User, 'id'> = {
                name: cleanName,
                email: cleanEmail,
                password,
                username,
                bio: '',
                profileImage:
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
                  encodeURIComponent(cleanEmail),
                following: [],
                followers: [],
              };

              return this.http.post<User>(this.baseUrl, newUser).pipe(
                map((created) => ({
                  success: true,
                  message: `Welcome, @${created.username}. Your account is ready.`,
                  user: created,
                }))
              );
            })
          );
        }),
        catchError((error) =>
          of({
            success: false,
            message: getUserFacingErrorMessage(
              error,
              'We could not create your account right now. Please try again.'
            ),
          })
        )
      );
  }

  login(email: string, password: string): Observable<AuthResult> {
    const cleanEmail = this.normalizeEmail(email);

    return this.http
      .get<User[]>(`${this.baseUrl}?email=${encodeURIComponent(cleanEmail)}`)
      .pipe(
        map((users) => {
          const user = users[0];

          if (!user) {
            return {
              success: false,
              message: `We couldn't find an account for ${cleanEmail}.`,
            };
          }

          if (user.password !== password) {
            return {
              success: false,
              message: 'That password does not match this account.',
            };
          }

          this.persistCurrentUser(user);

          return {
            success: true,
            message: 'Welcome back.',
            user,
          };
        }),
        catchError((error) =>
          of({
            success: false,
            message: getUserFacingErrorMessage(
              error,
              'We could not log you in right now. Please try again.'
            ),
          })
        )
      );
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.sessionKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return null;
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private persistCurrentUser(user: User): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
  }

  private buildUniqueUsername(name: string, email: string, users: User[]): string {
    const existing = new Set(users.map((user) => user.username.toLowerCase()));
    const baseFromName = name.toLowerCase().replace(/[^a-z0-9._]+/g, '');
    const fallback = email.split('@')[0].replace(/[^a-z0-9._]+/gi, '');
    const base = (baseFromName || fallback || 'user').slice(0, 18);

    let candidate = base;
    let suffix = 1;

    while (existing.has(candidate)) {
      suffix += 1;
      candidate = `${base}${suffix}`.slice(0, 24);
    }

    return candidate;
  }
}
