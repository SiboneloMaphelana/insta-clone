import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/comment.model';
import { getUserFacingErrorMessage } from '../../core/http-error.util';

export interface FeedRow {
  post: Post;
  author: User;
  comments: Array<{ c: Comment; author: User }>;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  feed: FeedRow[] = [];
  storyUsers: User[] = [];
  suggestions: User[] = [];
  current: User | null = null;
  loading = true;
  error = '';
  followError = '';
  feedQuery = '';
  commentDraft: Record<number, string> = {};
  postFeedback: Record<number, string> = {};

  private usersById = new Map<number, User>();
  private followingIds = new Set<number>();
  private readonly pendingLikeIds = new Set<number>();
  private readonly pendingCommentIds = new Set<number>();
  private readonly pendingFollowIds = new Set<number>();

  constructor(
    private auth: AuthService,
    private router: Router,
    private postsApi: PostService,
    private usersApi: UserService,
    private followApi: FollowService
  ) {}

  ngOnInit(): void {
    this.current = this.auth.getCurrentUser();
    if (!this.current) {
      this.router.navigate(['/login']);
      return;
    }

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  avatar(u: User | null | undefined): string {
    if (u?.profileImage) {
      return u.profileImage;
    }

    const seed = u?.username ?? 'guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }

  get filteredFeed(): FeedRow[] {
    const query = this.feedQuery.trim().toLowerCase();

    if (!query) {
      return this.feed;
    }

    return this.feed.filter(
      (row) =>
        row.post.caption.toLowerCase().includes(query) ||
        row.author.username.toLowerCase().includes(query) ||
        row.author.name.toLowerCase().includes(query)
    );
  }

  retryLoad(): void {
    this.load();
  }

  followSuggestion(user: User): void {
    if (!this.current) {
      return;
    }

    const userId = Number(user.id);
    if (this.pendingFollowIds.has(userId)) {
      return;
    }

    this.followError = '';
    this.pendingFollowIds.add(userId);

    this.followApi.follow(Number(this.current.id), userId).subscribe({
      next: () => {
        this.load();
      },
      error: (error) => {
        this.followError = getUserFacingErrorMessage(
          error,
          'We could not follow this profile right now. Please try again.'
        );
        this.pendingFollowIds.delete(userId);
      },
      complete: () => {
        this.pendingFollowIds.delete(userId);
      },
    });
  }

  toggleLike(row: FeedRow): void {
    if (!this.current) {
      return;
    }

    const postId = row.post.id;
    if (this.pendingLikeIds.has(postId)) {
      return;
    }

    const currentUserId = Number(this.current.id);
    const previousPost = {
      ...row.post,
      likedBy: [...row.post.likedBy],
      comments: [...row.post.comments],
    };
    const liked = previousPost.likedBy.includes(currentUserId);

    row.post = {
      ...previousPost,
      likedBy: liked
        ? previousPost.likedBy.filter((value) => value !== currentUserId)
        : [...previousPost.likedBy, currentUserId],
      likes: Math.max(0, previousPost.likes + (liked ? -1 : 1)),
    };
    delete this.postFeedback[postId];
    this.pendingLikeIds.add(postId);

    this.postsApi.toggleLike(previousPost, currentUserId).subscribe({
      next: (updatedPost) => {
        row.post = updatedPost;
      },
      error: (error) => {
        row.post = previousPost;
        this.postFeedback[postId] = getUserFacingErrorMessage(
          error,
          'We could not update your like right now. Please try again.'
        );
      },
      complete: () => {
        this.pendingLikeIds.delete(postId);
      },
    });
  }

  likedByMe(post: Post): boolean {
    if (!this.current) {
      return false;
    }

    return post.likedBy.includes(Number(this.current.id));
  }

  submitComment(row: FeedRow): void {
    if (!this.current) {
      return;
    }

    const postId = row.post.id;
    if (this.pendingCommentIds.has(postId)) {
      return;
    }

    const text = (this.commentDraft[postId] ?? '').trim();
    if (!text) {
      this.postFeedback[postId] = 'Write a comment before posting it.';
      return;
    }

    delete this.postFeedback[postId];
    this.pendingCommentIds.add(postId);

    this.postsApi.addComment(postId, Number(this.current.id), text).subscribe({
      next: ({ comment, post }) => {
        row.post = post;
        const author = this.usersById.get(Number(comment.userId)) ?? this.current;

        if (author) {
          row.comments = [...row.comments, { c: comment, author }];
        }

        this.commentDraft[postId] = '';
      },
      error: (error) => {
        this.postFeedback[postId] = getUserFacingErrorMessage(
          error,
          'We could not post your comment right now. Please try again.'
        );
      },
      complete: () => {
        this.pendingCommentIds.delete(postId);
      },
    });
  }

  clearPostFeedback(postId: number): void {
    delete this.postFeedback[postId];
  }

  isFollowingSuggestion(userId: number): boolean {
    return this.pendingFollowIds.has(userId);
  }

  isLikePending(postId: number): boolean {
    return this.pendingLikeIds.has(postId);
  }

  isCommentPending(postId: number): boolean {
    return this.pendingCommentIds.has(postId);
  }

  private load(): void {
    if (!this.current) {
      return;
    }

    this.loading = true;
    this.error = '';
    const me = Number(this.current.id);

    forkJoin({
      posts: this.postsApi.getPosts(),
      users: this.usersApi.getUsers(),
      comments: this.postsApi.getComments(),
      follows: this.followApi.listByFollower(me),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ posts, users, comments, follows }) => {
          this.usersById.clear();
          users.forEach((user) => this.usersById.set(Number(user.id), user));
          this.followingIds = new Set(follows.map((follow) => follow.followingId));

          const visible = (userId: number) =>
            userId === me || this.followingIds.has(userId);
          const commentMap = new Map<number, Comment[]>();

          comments.forEach((comment) => {
            const list = commentMap.get(comment.postId) ?? [];
            list.push(comment);
            commentMap.set(comment.postId, list);
          });

          commentMap.forEach((list) =>
            list.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          );

          this.feed = posts
            .filter((post) => visible(Number(post.userId)))
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .map((post) => {
              const author = this.usersById.get(Number(post.userId));
              if (!author) {
                return null;
              }

              const commentsWithAuthors = (commentMap.get(post.id) ?? [])
                .map((comment) => {
                  const commentAuthor = this.usersById.get(Number(comment.userId));

                  if (!commentAuthor) {
                    return null;
                  }

                  return { c: comment, author: commentAuthor };
                })
                .filter(
                  (
                    value
                  ): value is {
                    c: Comment;
                    author: User;
                  } => value !== null
                );

              return {
                post,
                author,
                comments: commentsWithAuthors,
              };
            })
            .filter((row): row is FeedRow => row !== null);

          const followingUsers = users.filter((user) =>
            this.followingIds.has(Number(user.id))
          );
          const self = this.usersById.get(me);

          this.storyUsers = self
            ? [self, ...followingUsers.filter((user) => Number(user.id) !== me)].slice(
                0,
                11
              )
            : [];
          this.suggestions = users
            .filter(
              (user) =>
                Number(user.id) !== me && !this.followingIds.has(Number(user.id))
            )
            .slice(0, 8);
          this.loading = false;
        },
        error: (error) => {
          this.error = getUserFacingErrorMessage(
            error,
            'We could not load your feed right now. Please try again.'
          );
          this.feed = [];
          this.storyUsers = [];
          this.suggestions = [];
          this.loading = false;
        },
      });
  }
}
