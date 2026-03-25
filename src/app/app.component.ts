import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Hanami';

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login'], {
      queryParams: { loggedOut: '1' },
    });
  }

  isDark(): boolean {
    return this.theme.get() === 'dark';
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
