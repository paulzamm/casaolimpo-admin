import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles: Role[];
  children?: MenuItem[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav {
  authService = inject(AuthService);
  sanitizer = inject(DomSanitizer);
  
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: '<path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>', 
      route: '/pages/dashboard',
      roles: [Role.ADMIN, Role.VENDEDOR]
    },
    {
      label: 'Inventario',
      icon: '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>',
      roles: [Role.ADMIN, Role.VENDEDOR],
      isOpen: false,
      children: [
        { label: 'Productos', route: '/pages/products', roles: [Role.ADMIN, Role.VENDEDOR], icon: '' },
        { label: 'Categorías', route: '/pages/categories', roles: [Role.ADMIN], icon: '' },
        { label: 'Marcas', route: '/pages/brands', roles: [Role.ADMIN], icon: '' },
      ]
    },
    {
      label: 'Ventas',
      icon: '<path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 001-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"></path>',
      roles: [Role.ADMIN, Role.VENDEDOR],
      isOpen: false,
      children: [
        { label: 'Punto de Venta', route: '/pages/sales/pos', roles: [Role.ADMIN, Role.VENDEDOR], icon: '' },
        { label: 'Historial', route: '/pages/sales/history', roles: [Role.ADMIN, Role.VENDEDOR], icon: '' },
      ]
    },
    {
      label: 'Clientes',
      icon: '<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>',
      route: '/pages/clients',
      roles: [Role.ADMIN, Role.VENDEDOR]
    },
    {
      label: 'Usuarios',
      icon: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path>',
      route: '/pages/users',
      roles: [Role.ADMIN]
    }
  ]);

  hasPermission(allowedRoles: Role[]): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return allowedRoles.includes(user.rol);
  }

  toggleSubmenu(item: MenuItem) {
    item.isOpen = !item.isOpen;
  }

  getSafeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}
