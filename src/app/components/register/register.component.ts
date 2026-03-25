import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  fieldsMatchValidator,
  strongPasswordValidator,
  trimmedRequiredValidator,
} from '../../core/form-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  readonly registerForm = this.fb.nonNullable.group(
    {
      name: ['', [trimmedRequiredValidator, Validators.minLength(2)]],
      email: ['', [trimmedRequiredValidator, Validators.email]],
      password: ['', [trimmedRequiredValidator, strongPasswordValidator(8)]],
      confirmPassword: ['', [trimmedRequiredValidator]],
    },
    { validators: fieldsMatchValidator('password', 'confirmPassword', 'passwordMismatch') }
  );

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  get nameErrorMessage(): string {
    const control = this.registerForm.controls.name;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Tell people what to call you.';
    }

    if (control.hasError('minlength')) {
      return 'Use at least 2 characters for your name.';
    }

    return '';
  }

  get emailErrorMessage(): string {
    const control = this.registerForm.controls.email;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Enter the email address you want to use for this account.';
    }

    if (control.hasError('email')) {
      return 'Use a valid email address, for example name@example.com.';
    }

    return '';
  }

  get passwordErrorMessage(): string {
    const control = this.registerForm.controls.password;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Create a password to protect your account.';
    }

    if (
      control.hasError('minlength') ||
      control.hasError('letter') ||
      control.hasError('number')
    ) {
      return 'Use at least 8 characters with both letters and numbers.';
    }

    if (control.hasError('whitespace')) {
      return 'Passwords cannot include spaces.';
    }

    return '';
  }

  get confirmPasswordErrorMessage(): string {
    const control = this.registerForm.controls.confirmPassword;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Confirm your password to make sure it matches.';
    }

    if (this.passwordMismatch) {
      return 'The confirmation password does not match.';
    }

    return '';
  }

  get passwordMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      this.registerForm.controls.confirmPassword.touched
    );
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please review the highlighted fields before creating your account.';
      return;
    }

    const { name, email, password } = this.registerForm.getRawValue();

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(name, email, password).subscribe({
      next: (result) => {
        this.isLoading = false;

        if (result.success) {
          this.successMessage = `${result.message} Redirecting to login...`;

          window.setTimeout(() => {
            this.router.navigate(['/login'], {
              queryParams: { registered: '1' },
            });
          }, 900);
          return;
        }

        this.errorMessage = result.message;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage =
          'We could not create your account right now. Please try again.';
      },
    });
  }

  clearFeedback(): void {
    this.errorMessage = '';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
