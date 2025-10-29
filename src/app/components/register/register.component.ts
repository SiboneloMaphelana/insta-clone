import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordMatchValidator });

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    const name = this.registerForm.value.name || '';
    const email = this.registerForm.value.email || '';
    const password = this.registerForm.value.password || '';

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(name, email, password).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.successMessage = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = result.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred during registration. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  get passwordMismatch(): boolean {
    return this.registerForm.hasError('passwordMismatch') && 
           this.registerForm.get('confirmPassword')?.touched || false;
  }
}