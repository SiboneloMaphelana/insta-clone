import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'hanami-theme';

  constructor() {
    this.apply(this.get());
  }

  get(): ThemeMode {
    const v = localStorage.getItem(this.key);
    if (v === 'dark' || v === 'light') return v;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }

  set(mode: ThemeMode): void {
    localStorage.setItem(this.key, mode);
    this.apply(mode);
  }

  toggle(): void {
    this.set(this.get() === 'dark' ? 'light' : 'dark');
  }

  private apply(mode: ThemeMode): void {
    document.documentElement.dataset['theme'] = mode;
  }
}
