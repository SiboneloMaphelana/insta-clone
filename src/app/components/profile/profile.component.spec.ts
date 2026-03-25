import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { FollowService } from '../../services/follow.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProfileComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ id: 1, username: 'demo', profileImage: '' }),
          },
        },
        {
          provide: UserService,
          useValue: {
            getByUsername: () => of([]),
          },
        },
        {
          provide: PostService,
          useValue: {
            getPosts: () => of([]),
          },
        },
        {
          provide: FollowService,
          useValue: {
            listByFollowing: () => of([]),
            listByFollower: () => of([]),
            find: () => of(null),
            follow: () => of({}),
            unfollow: () => of(void 0),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
