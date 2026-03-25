import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, map, of, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { FollowService } from '../../services/follow.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { Follow } from '../../models/follow.model';
import { getUserFacingErrorMessage } from '../../core/http-error.util';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  profileUser: User | null = null;
  current: User | null = null;
  posts: Post[] = [];
  followerCount = 0;
  followingCount = 0;
  activeFollow: Follow | null = null;
  loading = true;
  notFound = false;
  error = '';
  followError = '';
  followPending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private usersApi: UserService,
    private postsApi: PostService,
    private followApi: FollowService
  ) {}

  ngOnInit(): void {
    this.current = this.auth.getCurrentUser();
    if (!this.current) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.resolveProfile(this.route.snapshot.paramMap.get('username'));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isSelf(): boolean {
    if (!this.current || !this.profileUser) {
      return false;
    }

    return Number(this.current.id) === Number(this.profileUser.id);
  }

  avatar(user: User | null | undefined): string {
    if (user?.profileImage) {
      return user.profileImage;
    }

    const seed = user?.username ?? 'guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }

  retryLoad(): void {
    this.resolveProfile(this.route.snapshot.paramMap.get('username'));
  }

  toggleFollow(): void {
    if (!this.current || !this.profileUser || this.isSelf || this.followPending) {
      return;
    }

    const me = Number(this.current.id);
    const them = Number(this.profileUser.id);
    this.followError = '';
    this.followPending = true;

    const request = this.activeFollow
      ? this.followApi
          .unfollow(this.activeFollow.id)
          .pipe(map(() => null as Follow | null))
      : this.followApi.follow(me, them).pipe(map((follow) => follow as Follow | null));

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (follow) => {
        if (follow) {
          this.activeFollow = follow;
          this.followerCount += 1;
        } else {
          this.activeFollow = null;
          this.followerCount = Math.max(0, this.followerCount - 1);
        }
      },
      error: (error) => {
        this.followError = getUserFacingErrorMessage(
          error,
          'We could not update this follow relationship right now. Please try again.'
        );
        this.followPending = false;
      },
      complete: () => {
        this.followPending = false;
      },
    });
  }

  private resolveProfile(username: string | null): void {
    if (!this.current) {
      return;
    }

    this.loading = true;
    this.notFound = false;
    this.error = '';
    this.followError = '';
    this.profileUser = null;
    this.posts = [];
    this.followerCount = 0;
    this.followingCount = 0;
    this.activeFollow = null;

    const request = username
      ? this.usersApi.getByUsername(username)
      : of([this.current]);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (rows) => {
        const user = rows[0];

        if (!user) {
          this.profileUser = null;
          this.posts = [];
          this.notFound = true;
          this.loading = false;
          return;
        }

        this.profileUser = user;
        this.notFound = false;
        this.loadProfileData(user);
      },
      error: (error) => {
        this.profileUser = null;
        this.posts = [];
        this.notFound = false;
        this.error = getUserFacingErrorMessage(
          error,
          'We could not load this profile right now. Please try again.'
        );
        this.loading = false;
      },
    });
  }

  private loadProfileData(user: User): void {
    if (!this.current) {
      return;
    }

    const profileUserId = Number(user.id);
    const currentUserId = Number(this.current.id);
    const isOwnProfile = profileUserId === currentUserId;

    forkJoin({
      posts: this.postsApi.getPosts(),
      followers: this.followApi.listByFollowing(profileUserId),
      following: this.followApi.listByFollower(profileUserId),
      relation: isOwnProfile
        ? of(null)
        : this.followApi.find(currentUserId, profileUserId),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ posts, followers, following, relation }) => {
          this.posts = posts
            .filter((post) => Number(post.userId) === profileUserId)
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          this.followerCount = followers.length;
          this.followingCount = following.length;
          this.activeFollow = relation;
          this.loading = false;
        },
        error: (error) => {
          this.error = getUserFacingErrorMessage(
            error,
            'We could not load this profile right now. Please try again.'
          );
          this.loading = false;
        },
      });
  }
}
