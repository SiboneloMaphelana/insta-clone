import { Injectable } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private users: User[] = [];

  constructor() {
    const storedUsers = localStorage.getItem('users');
    this.users = storedUsers ? JSON.parse(storedUsers) : [];
  }

  register(user: User): void {
    const emailExists = this.users.some(
      (userEmail) => userEmail.email === user.email
    );

    if (emailExists) {
      console.error('Email already exists');
      return;
    }

    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  login(email: string, password: string): boolean {
    const user = this.users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  }
}
