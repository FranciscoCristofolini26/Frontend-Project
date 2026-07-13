import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
        path: 'home', 
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent) 
    },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];
