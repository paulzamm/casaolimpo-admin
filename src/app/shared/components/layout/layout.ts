import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Sidenav } from '../sidenav/sidenav';
import { initFlowbite } from 'flowbite';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidenav, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  isDarkMode: boolean = false;
  currentUser;

  constructor(private router: Router, private authService: AuthService) {
    this.currentUser = this.authService.currentUser;
    this.authService.getMe().subscribe();
  }

  ngOnInit(): void {
    initFlowbite();
    this.checkInitialTheme();
    
  }

  // Lógica del Tema Oscuro
  checkInitialTheme() {
    // Verificar si hay preferencia guardada o preferencia del sistema
    if (localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      this.isDarkMode = true;
    } else {
      document.documentElement.classList.remove('dark');
      this.isDarkMode = false;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    // Si ahora es oscuro
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }
  }

  logout(){
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
