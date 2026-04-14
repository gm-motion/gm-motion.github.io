import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  initFromStorage() {
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark';
    this.isDark.set(dark);
    document.body.classList.toggle('dark-theme', dark);
  }

  toggleTheme() {
    const next = !this.isDark();
    this.isDark.set(next);

    document.body.classList.toggle('dark-theme', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }
}
