import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Modal } from 'flowbite';
import { toast } from 'ngx-sonner';
import { SaleService } from '../../../core/services/sale.service';
import { AuthService } from '../../../core/services/auth.service';
import { Sale, MetodoPago } from '../../../core/models/sale.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  private saleService = inject(SaleService);
  authService = inject(AuthService);
  private router = inject(Router);

  Math = Math;
  MetodoPago = MetodoPago;

  // Estados
  sales = signal<Sale[]>([]);
  selectedSale = signal<Sale | null>(null);
  isLoading = signal(false);

  // Filtros
  searchTerm = signal('');
  fechaInicio = signal('');
  fechaFin = signal('');
  selectedMetodoPago = signal('');

  // Paginación
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(1);

  // Modal
  detailModal: any;

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.isLoading.set(true);
    
    const params: any = {
      skip: (this.currentPage() - 1) * this.itemsPerPage(),
      limit: this.itemsPerPage()
    };

    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.fechaInicio()) params.start_date = this.fechaInicio();
    if (this.fechaFin()) params.end_date = this.fechaFin();
    if (this.selectedMetodoPago()) params.metodo_pago = this.selectedMetodoPago();

    this.saleService.getSales(params).subscribe({
      next: (sales) => {
        this.sales.set(sales);
        this.totalItems.set(sales.length);
        // Sin paginación real del backend, calculamos páginas basadas en items mostrados
        this.totalPages.set(sales.length > 0 ? this.currentPage() : 1);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar ventas:', error);
        toast.error('Error al cargar historial de ventas');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  onFechaInicioChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechaInicio.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  onFechaFinChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechaFin.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  onMetodoPagoChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedMetodoPago.set(value);
    this.currentPage.set(1);
    this.loadSales();
  }

  openDetailModal(sale: Sale): void {
    this.selectedSale.set(sale);
    const modalElement = document.getElementById('saleDetailModal');
    if (modalElement) {
      this.detailModal = new Modal(modalElement);
      this.detailModal.show();
    }
  }

  closeDetailModal(): void {
    if (this.detailModal) {
      this.detailModal.hide();
    }
    this.selectedSale.set(null);
  }

  getMetodoPagoBadge(metodo: string): string {
    switch (metodo) {
      case MetodoPago.EFECTIVO:
        return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900 dark:text-green-300';
      case MetodoPago.TARJETA:
        return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900 dark:text-blue-300';
      case MetodoPago.TRANSFERENCIA:
        return 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToNewSale(): void {
    this.router.navigate(['/pages/sales/pos']);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadSales();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadSales();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadSales();
  }

  getPageNumbers(): number[] {
    const pages = this.totalPages();
    if (pages <= 0) return [];
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
}
