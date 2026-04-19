import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isLight = signal(false);

  initFromStorage() {
    const stored = localStorage.getItem('theme');
    const light = stored === 'light';
    this.isLight.set(light);
    document.body.classList.toggle('light-theme', light);
  }

  toggleTheme() {
    const next = !this.isLight();
    this.isLight.set(next);

    document.body.classList.toggle('light-theme', next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  }
}
