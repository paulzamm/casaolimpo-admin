import { Routes } from '@angular/router';
import { authenticatedGuard } from './core/guards/authenticated.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
        canActivate: [authenticatedGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
        canActivate: [authenticatedGuard]
    },
    {
        path: 'pages',
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
