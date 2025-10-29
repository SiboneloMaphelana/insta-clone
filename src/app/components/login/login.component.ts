import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  errorMessage = '';
  isLoading = false;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    const email = this.loginForm.value.email || '';
    const password = this.loginForm.value.password || '';

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(email, password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}