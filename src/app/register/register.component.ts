import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { User } from '../user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  registerUser(): void {
    if (this.registerForm.valid) {
      const newUser: User = {
        id: Date.now().toString(),
        name: this.registerForm.value.name!,
        email: this.registerForm.value.email!,
        password: this.registerForm.value.password!,
      };
      this.authService.register(newUser);
      this.router.navigate(['/login']);
      this.registerForm.reset();
    }
  }
}
