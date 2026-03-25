import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import {
  httpUrlValidator,
  trimmedRequiredValidator,
} from '../../core/form-validators';
import { getUserFacingErrorMessage } from '../../core/http-error.util';

type PreviewState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent {
  readonly form = this.fb.nonNullable.group({
    imageUrl: ['', [trimmedRequiredValidator, httpUrlValidator]],
    caption: ['', [trimmedRequiredValidator, Validators.maxLength(2200)]],
  });

  submitting = false;
  error = '';
  previewState: PreviewState = 'idle';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private posts: PostService,
    private router: Router
  ) {}

  get imageUrlErrorMessage(): string {
    const control = this.form.controls.imageUrl;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Paste the image URL you want to share.';
    }

    if (control.hasError('invalidUrl')) {
      return 'Use a full http or https image URL.';
    }

    return '';
  }

  get captionErrorMessage(): string {
    const control = this.form.controls.caption;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Write a caption so people know what they are seeing.';
    }

    if (control.hasError('maxlength')) {
      return 'Captions can be up to 2200 characters long.';
    }

    return '';
  }

  get captionLength(): number {
    return this.form.controls.caption.value.trim().length;
  }

  get previewUrl(): string {
    const value = this.form.controls.imageUrl.value.trim();
    return this.form.controls.imageUrl.invalid || !value ? '' : value;
  }

  onImageUrlInput(): void {
    this.error = '';
    this.previewState = this.previewUrl ? 'loading' : 'idle';
  }

  onCaptionInput(): void {
    this.error = '';
  }

  onPreviewLoad(): void {
    this.previewState = 'loaded';
  }

  onPreviewError(): void {
    this.previewState = 'error';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fix the highlighted fields before sharing your post.';
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/create-post' },
      });
      return;
    }

    const { imageUrl, caption } = this.form.getRawValue();

    this.submitting = true;
    this.error = '';

    this.posts
      .createPost({
        userId: Number(user.id),
        caption,
        imageUrl,
        likes: 0,
        likedBy: [],
        timestamp: new Date().toISOString(),
        comments: [],
      })
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (error) => {
          this.error = getUserFacingErrorMessage(
            error,
            'We could not share your post right now. Please try again.'
          );
          this.submitting = false;
        },
      });
  }
}
