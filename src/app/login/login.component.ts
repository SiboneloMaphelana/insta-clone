import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  onLogin() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email!;
      const password = this.loginForm.value.password!;
      this.authenticationService.login(email, password);
      this.router.navigate(['/home']);
      this.loginForm.reset();
    }
  }
}
