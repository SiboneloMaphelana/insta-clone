import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trimmedRequiredValidator } from '../../core/form-validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [trimmedRequiredValidator, Validators.email]],
    password: ['', [trimmedRequiredValidator, Validators.minLength(6)]],
  });

  errorMessage = '';
  infoMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
      return;
    }

    if (this.route.snapshot.queryParamMap.get('registered')) {
      this.infoMessage = 'Your account is ready. Log in with your new details.';
      return;
    }

    if (this.route.snapshot.queryParamMap.get('loggedOut')) {
      this.infoMessage = 'You have been logged out safely.';
      return;
    }

    if (this.route.snapshot.queryParamMap.get('returnUrl')) {
      this.infoMessage = 'Please log in to continue.';
    }
  }

  get emailErrorMessage(): string {
    const control = this.loginForm.controls.email;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Enter the email address linked to your account.';
    }

    if (control.hasError('email')) {
      return 'Use a valid email address, for example name@example.com.';
    }

    return '';
  }

  get passwordErrorMessage(): string {
    const control = this.loginForm.controls.password;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Enter your password to continue.';
    }

    if (control.hasError('minlength')) {
      return 'Passwords must be at least 6 characters long.';
    }

    return '';
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fix the highlighted fields before continuing.';
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(email, password).subscribe({
      next: (result) => {
        this.isLoading = false;

        if (result.success) {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const safeReturnUrl =
            !!returnUrl &&
            returnUrl.startsWith('/') &&
            !returnUrl.startsWith('//');

          this.router.navigateByUrl(safeReturnUrl ? returnUrl : '/home');
          return;
        }

        this.errorMessage = result.message;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'We could not log you in right now. Please try again.';
      },
    });
  }

  clearFeedback(): void {
    this.errorMessage = '';
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
