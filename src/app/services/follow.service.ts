import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { Follow } from '../models/follow.model';

@Injectable({ providedIn: 'root' })
export class FollowService {
  private readonly url = `${API_BASE_URL}/follows`;

  constructor(private http: HttpClient) {}

  listByFollower(followerId: number): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.url}?followerId=${followerId}`);
  }

  listByFollowing(followingId: number): Observable<Follow[]> {
    return this.http.get<Follow[]>(`${this.url}?followingId=${followingId}`);
  }

  find(followerId: number, followingId: number): Observable<Follow | null> {
    return this.http
      .get<Follow[]>(
        `${this.url}?followerId=${followerId}&followingId=${followingId}`
      )
      .pipe(map((rows) => rows[0] ?? null));
  }

  follow(followerId: number, followingId: number): Observable<Follow> {
    if (followerId === followingId) {
      return throwError(() => new Error('You cannot follow your own profile.'));
    }

    return this.find(followerId, followingId).pipe(
      switchMap((existing) =>
        existing
          ? of(existing)
          : this.http.post<Follow>(this.url, { followerId, followingId })
      )
    );
  }

  unfollow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
