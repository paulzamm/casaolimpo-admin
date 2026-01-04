import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, Token } from '../models/auth.model';
import { User, UserCreate } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.apiUrl;

    currentUser = signal<User | null>(null);

    constructor() {
        this.loadUserFromStorage();
    }

    login(credentials: LoginRequest): Observable<Token> {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        return this.http.post<Token>(`${this.apiUrl}/token`, formData).pipe(
            tap(token => {
                this.setToken(token.access_token);
                this.getMe().subscribe();
            })
        );
    }

    register(user: UserCreate): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, user);
    }

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
            tap(user => {
                this.currentUser.set(user);
                localStorage.setItem('user', JSON.stringify(user));
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        const user = this.currentUser();
        return user?.rol === 'ADMIN';
    }

    isVendedor(): boolean {
        const user = this.currentUser();
        return user?.rol === 'VENDEDOR';
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private setToken(token: string) {
        localStorage.setItem('token', token);
    }

    private loadUserFromStorage() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                this.currentUser.set(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user from storage', e);
                this.logout();
            }
        }
    }
}
