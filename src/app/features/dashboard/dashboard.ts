import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  authService = inject(AuthService);
  private router = inject(Router);

  // Estados
  dashboard = signal<DashboardData | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        toast.error('Error al cargar datos del dashboard');
        this.isLoading.set(false);
      }
    });
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  goToInventory(): void {
    this.router.navigate(['/pages/products']);
  }

  goToClients(): void {
    this.router.navigate(['/pages/clients']);
  }

  goToSales(): void {
    this.router.navigate(['/pages/sales/history']);
  }

  goToNewSale(): void {
    this.router.navigate(['/pages/sales/pos']);
  }
}

