import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = "http://localhost:3000/users"
  private users: User[] | undefined;
  constructor(private http: HttpClient, private userService: UserService) {
    this.userService.getUsers().subscribe({
      next: (users) => this.users = users
    })
   }

  login(email: string, password: string): Observable<User> {
    return this.http.get<User>(`${this.url}?email=${email}&password=${password}`);

  }
}
