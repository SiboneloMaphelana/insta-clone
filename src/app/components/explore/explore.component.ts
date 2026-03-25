import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { getUserFacingErrorMessage } from '../../core/http-error.util';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  posts: Post[] = [];
  usersById = new Map<number, User>();
  query = '';
  loading = true;
  error = '';

  constructor(private postsApi: PostService, private usersApi: UserService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filtered(): Post[] {
    const query = this.query.trim().toLowerCase();

    if (!query) {
      return this.posts;
    }

    return this.posts.filter((post) => {
      const caption = post.caption.toLowerCase();
      const author = this.usersById.get(post.userId);
      const username = author?.username?.toLowerCase() ?? '';
      const name = author?.name?.toLowerCase() ?? '';
      return (
        caption.includes(query) ||
        username.includes(query) ||
        name.includes(query)
      );
    });
  }

  get emptyStateMessage(): string {
    const query = this.query.trim();

    if (!this.posts.length) {
      return 'No posts are available yet. Create one to start the gallery.';
    }

    return `No posts match "${query}".`;
  }

  retryLoad(): void {
    this.load();
  }

  author(post: Post): User | undefined {
    return this.usersById.get(post.userId);
  }

  profileLink(post: Post): string[] {
    const author = this.author(post);
    return author ? ['/profile', author.username] : ['/explore'];
  }

  private load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      posts: this.postsApi.getPosts(),
      users: this.usersApi.getUsers(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ posts, users }) => {
          this.usersById.clear();
          users.forEach((user) => this.usersById.set(Number(user.id), user));
          this.posts = [...posts].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.loading = false;
        },
        error: (error) => {
          this.error = getUserFacingErrorMessage(
            error,
            'We could not load explore right now. Please try again.'
          );
          this.posts = [];
          this.usersById.clear();
          this.loading = false;
        },
      });
  }
}
