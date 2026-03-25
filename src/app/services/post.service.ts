import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly postsUrl = `${API_BASE_URL}/posts`;
  private readonly commentsUrl = `${API_BASE_URL}/comments`;

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.postsUrl);
  }

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.commentsUrl);
  }

  createPost(partial: Omit<Post, 'id'>): Observable<Post> {
    const caption = partial.caption.trim();
    const imageUrl = partial.imageUrl.trim();

    if (!caption) {
      return throwError(() => new Error('Add a caption before sharing your post.'));
    }

    return this.http.post<Post>(this.postsUrl, {
      ...partial,
      caption,
      imageUrl,
      comments: [...partial.comments],
      likedBy: [...partial.likedBy],
    });
  }

  updatePost(id: number, patch: Partial<Post>): Observable<Post> {
    return this.http.patch<Post>(`${this.postsUrl}/${id}`, patch);
  }

  toggleLike(post: Post, userId: number): Observable<Post> {
    const likedBySource = Array.isArray(post.likedBy) ? post.likedBy : [];
    const liked = likedBySource.includes(userId);
    const likedBy = liked
      ? likedBySource.filter((value) => value !== userId)
      : [...likedBySource, userId];
    const likes = Math.max(0, post.likes + (liked ? -1 : 1));

    return this.updatePost(post.id, { likedBy, likes });
  }

  addComment(
    postId: number,
    userId: number,
    text: string
  ): Observable<{ comment: Comment; post: Post }> {
    const cleanText = text.trim();

    if (!cleanText) {
      return throwError(() => new Error('Write a comment before posting it.'));
    }

    const body: Omit<Comment, 'id'> = {
      postId,
      userId,
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    return this.http.post<Comment>(this.commentsUrl, body).pipe(
      switchMap((comment) =>
        this.getPost(postId).pipe(
          switchMap((post) =>
            this.updatePost(postId, {
              comments: [...post.comments, comment.id],
            }).pipe(map((updated) => ({ comment, post: updated })))
          )
        )
      )
    );
  }

  private getPost(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.postsUrl}/${postId}`);
  }
}
