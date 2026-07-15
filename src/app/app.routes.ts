import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Habits } from './features/habits/habits';
import { Goals } from './features/goals/goals';
import { Notes } from './features/notes/notes';

export const routes: Routes = [
    { 
        path: 'home', 
        component: Home
    },
    { 
        path: '/login', 
        component: Login
    },
    { 
        path: '/habits', 
        component: Habits
    },
    { 
        path: '/goals', 
        component: Goals
    },
    { 
        path: '/notes', 
        component: Notes
    },
    {
        path: 'login', 

    }
];
