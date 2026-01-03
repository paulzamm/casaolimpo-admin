import { Routes } from '@angular/router';
import { authenticatedGuard } from './core/guards/authenticated.guard';
import { authGuard } from './core/guards/auth.guard';
import { Layout } from './shared/components/layout/layout';

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
        component: Layout,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/clients/clients').then(m => m.Clients)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/users').then(m => m.Users)
            },
            {
                path: 'brands',
                loadComponent: () => import('./features/inventory/brands/brands').then(m => m.Brands)
            },
            {
                path: 'categories',
                loadComponent: () => import('./features/inventory/categories/categories').then(m => m.Categories)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/inventory/products/products').then(m => m.Products)
            },
            {
                path: 'sales/details',
                loadComponent: () => import('./features/sales/details/details').then(m => m.Details)
            },
            {
                path: 'sales/history',
                loadComponent: () => import('./features/sales/history/history').then(m => m.History)
            },
            {
                path: 'sales/pos',
                loadComponent: () => import('./features/sales/pos/pos').then(m => m.Pos)
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
