// main.ts
import 'hammerjs'; // 1) make the global Hammer constructor available
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core'; // ← you need this
import { HammerModule } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    importProvidersFrom(HammerModule), // 2) register HammerModule’s providers
  ],
}).catch((err) => console.error(err));
