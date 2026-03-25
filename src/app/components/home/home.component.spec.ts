import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [HomeComponent, RelativeTimePipe],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({
              id: 1,
              username: 'demo',
              profileImage: '',
            }),
          },
        },
        {
          provide: PostService,
          useValue: {
            getPosts: () => of([]),
            getComments: () => of([]),
            addComment: () => of({ comment: {}, post: { comments: [] } }),
            toggleLike: () => of({}),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUsers: () => of([]),
          },
        },
        {
          provide: FollowService,
          useValue: {
            listByFollower: () => of([]),
            follow: () => of({}),
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
