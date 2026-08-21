import { Routes } from '@angular/router';
import { Calendar, Files, Goals, Habits, Home, Login, Notes, Projects, Schedule } from './pages';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'habits',
    component: Habits,
  },
  {
    path: 'goals',
    component: Goals,
  },
  {
    path: 'notes',
    component: Notes,
  },
  {
    path: 'calendar',
    component: Calendar,
  },
  {
    path: 'files',
    component: Files,
  },
  {
    path: 'projects',
    component: Projects,
  },
  {
    path: 'schedule',
    component: Schedule,
  },
  { path: '**', redirectTo: 'home' },
];
