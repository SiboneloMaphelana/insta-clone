import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CreatePostComponent } from './create-post.component';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';

describe('CreatePostComponent', () => {
  let component: CreatePostComponent;
  let fixture: ComponentFixture<CreatePostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [CreatePostComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ id: 1 }),
          },
        },
        {
          provide: PostService,
          useValue: {
            createPost: () => of({}),
          },
        },
      ],
    });
    fixture = TestBed.createComponent(CreatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
