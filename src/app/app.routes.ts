import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { WorkComponent } from './pages/work/work.component';
import { ContactComponent } from './pages/contact/contact.component';
import { WorkProjectComponent } from './pages/work-project/work-project.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'my-story', component: AboutComponent },
  { path: 'gfx-work', component: WorkComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'gfx-work/:slug',
    component: WorkProjectComponent,
  },
];
