// main.ts
import 'hammerjs';
import {bootstrapApplication} from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HammerModule } from '@angular/platform-browser';
import {provideRouter, withHashLocation} from '@angular/router';

import {AppComponent} from './app/app.component';
import {routes} from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    importProvidersFrom(HammerModule),
  ],
}).catch((err) => console.error(err));
