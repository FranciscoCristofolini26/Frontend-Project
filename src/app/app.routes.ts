import { Routes } from '@angular/router';
import { Calendar, Files, Goals, Habits, Home, Login, Notes, Projects } from './features';

export const routes: Routes = [
    { 
        path: 'home', 
        component: Home
    },
    { 
        path: 'login', 
        component: Login
    },
    { 
        path: 'habits', 
        component: Habits
    },
    { 
        path: 'goals', 
        component: Goals
    },
    { 
        path: 'notes', 
        component: Notes
    },
    {
        path: 'calendar', 
        component: Calendar
    },
    {
        path: 'files',
        component: Files
    },
    {
        path: 'projects',
        component: Projects
    }
];
