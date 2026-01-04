import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from 'flowbite';
import { ProductService } from '../../../core/services/product.service';
import { ClientService } from '../../../core/services/client.service';
import { SaleService } from '../../../core/services/sale.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { Product } from '../../../core/models/product.model';
import { Client } from '../../../core/models/client.model';
import { Category } from '../../../core/models/category.model';
import { Brand } from '../../../core/models/brand.model';
import { CartItem, MetodoPago, SaleCreate, SaleItem } from '../../../core/models/sale.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html',
  styleUrl: './pos.css',
})
export class Pos implements OnInit {
  private productService = inject(ProductService);
  private clientService = inject(ClientService);
  private saleService = inject(SaleService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private router = inject(Router);

  confirmModal: any;
  newClientModal: any;

  // Estados
  products = signal<Product[]>([]);
  clients = signal<Client[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  cart = signal<CartItem[]>([]);
  isLoading = signal(false);
  isProcessing = signal(false);
  isSavingClient = signal(false);

  // Nuevo Cliente Form
  newClient = signal<Partial<Client>>({
    cedula: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: '',
    direccion: '',
    ciudad: ''
  });

  // Filtros
  searchTerm = signal('');
  selectedCategory = signal('');
  selectedBrand = signal('');

  // Venta
  selectedClientId = signal('');
  metodoPago = signal<MetodoPago>(MetodoPago.EFECTIVO);
  descuentoPorcentaje = signal(0);

  // Computed
  MetodoPago = MetodoPago;

  subtotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.subtotal, 0);
  });

  descuentoMonto = computed(() => {
    return (this.subtotal() * this.descuentoPorcentaje()) / 100;
  });

  total = computed(() => {
    return this.subtotal() - this.descuentoMonto();
  });

  cartItemCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.cantidad, 0);
  });

  canProcessSale = computed(() => {
    return this.cart().length > 0 &&
      this.selectedClientId() !== '' &&
      !this.isProcessing();
  });

  ngOnInit(): void {
    this.loadProducts();
    this.loadClients();
    this.loadCategories();
    this.loadBrands();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAll({
      search: this.searchTerm() || undefined,
      category: this.selectedCategory() || undefined,
      brand: this.selectedBrand() || undefined,
      limit: 100
    }).subscribe({
      next: (response: { items: Product[], total: number }) => {
        this.products.set(response.items);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar productos');
        this.isLoading.set(false);
      }
    });
  }

  loadClients(): void {
    this.clientService.getAll({ limit: 100 }).subscribe({
      next: (clients: Client[]) => {
        this.clients.set(clients);
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        toast.error('Error al cargar clientes');
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll({ limit: 100 }).subscribe({
      next: (response: { items: Category[], total: number }) => {
        this.categories.set(response.items);
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadBrands(): void {
    this.brandService.getAll({ limit: 100 }).subscribe({
      next: (response: { items: Brand[], total: number }) => {
        this.brands.set(response.items);
      },
      error: (error: any) => {
        console.error('Error al cargar marcas:', error);
      }
    });
  }

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      toast.error('Producto sin stock disponible');
      return;
    }

    const currentCart = this.cart();
    const existingItem = currentCart.find(item => item.producto_id === product._id);

    if (existingItem) {
      if (existingItem.cantidad >= product.stock) {
        toast.error('No hay suficiente stock disponible');
        return;
      }

      const updatedCart = currentCart.map(item =>
        item.producto_id === product._id
          ? {
            ...item,
            cantidad: item.cantidad + 1,
            subtotal: (item.cantidad + 1) * item.precio_unitario
          }
          : item
      );
      this.cart.set(updatedCart);
      toast.success('Cantidad actualizada');
    } else {
      const newItem: CartItem = {
        producto_id: product._id!,
        codigo: product.codigo,
        nombre: product.nombre,
        precio_unitario: product.precio,
        cantidad: 1,
        stock_disponible: product.stock,
        subtotal: product.precio
      };
      this.cart.set([...currentCart, newItem]);
      toast.success('Producto agregado al carrito');
    }
  }

  updateQuantity(productoId: string, newQuantity: number): void {
    const currentCart = this.cart();
    const item = currentCart.find(i => i.producto_id === productoId);

    if (!item) return;

    if (newQuantity <= 0) {
      this.removeFromCart(productoId);
      return;
    }

    if (newQuantity > item.stock_disponible) {
      toast.error('Cantidad excede el stock disponible');
      return;
    }

    const updatedCart = currentCart.map(i =>
      i.producto_id === productoId
        ? {
          ...i,
          cantidad: newQuantity,
          subtotal: newQuantity * i.precio_unitario
        }
        : i
    );
    this.cart.set(updatedCart);
  }

  removeFromCart(productoId: string): void {
    const updatedCart = this.cart().filter(item => item.producto_id !== productoId);
    this.cart.set(updatedCart);
    toast.info('Producto eliminado del carrito');
  }

  clearCart(): void {
    this.cart.set([]);
    this.selectedClientId.set('');
    this.metodoPago.set(MetodoPago.EFECTIVO);
    this.descuentoPorcentaje.set(0);
    //toast.info('Carrito limpiado');
  }

  processSale(): void {
    if (!this.canProcessSale()) {
      if (this.cart().length === 0) {
        toast.error('El carrito está vacío');
      } else if (this.selectedClientId() === '') {
        toast.error('Debe seleccionar un cliente');
      }
      return;
    }

    // Abrir modal de confirmación
    this.openConfirmModal();
  }

  openConfirmModal(): void {
    const modalElement = document.getElementById('confirmSaleModal');
    if (modalElement) {
      this.confirmModal = new Modal(modalElement);
      this.confirmModal.show();
    }
  }

  closeConfirmModal(): void {
    if (this.confirmModal) {
      this.confirmModal.hide();
    }
  }

  confirmSale(): void {
    this.closeConfirmModal();
    this.isProcessing.set(true);

    const detalles = this.cart().map(item => ({
      product_id: item.producto_id,
      cantidad: item.cantidad
    }));

    const saleData: SaleCreate = {
      cliente_id: this.selectedClientId(),
      detalles: detalles,
      metodo_pago: this.metodoPago()
    };

    this.saleService.create(saleData).subscribe({
      next: (sale) => {
        toast.success(`Venta ${sale.numero_venta} procesada exitosamente`);
        this.clearCart();
        this.isProcessing.set(false);

        // Recargar productos para actualizar stock
        this.loadProducts();

        // Opcional: redirigir al detalle de la venta
        // this.router.navigate(['/sales', sale._id]);
      },
      error: (error) => {
        console.error('Error al procesar venta:', error);
        toast.error(error.error?.detail || 'Error al procesar venta');
        this.isProcessing.set(false);
      }
    });
  }

  cancelSale(): void {
    this.closeConfirmModal();
  }

  openNewClientModal(): void {
    const modalElement = document.getElementById('newClientModal');
    if (modalElement) {
      this.newClientModal = new Modal(modalElement);
      this.newClientModal.show();
    }
  }

  closeNewClientModal(): void {
    if (this.newClientModal) {
      this.newClientModal.hide();
    }
  }

  resetNewClientForm(): void {
    this.newClient.set({
      cedula: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      correo: '',
      direccion: '',
      ciudad: ''
    });
  }

  saveNewClient(): void {
    const client = this.newClient();
    
    // Validaciones básicas
    if (!client.cedula || !client.nombres || !client.apellidos) {
      toast.error('Cédula, nombres y apellidos son obligatorios');
      return;
    }

    this.isSavingClient.set(true);

    this.clientService.create(client as Client).subscribe({
      next: (newClient) => {
        toast.success('Cliente creado exitosamente');
        
        // Agregar el nuevo cliente a la lista
        this.clients.update(clients => [...clients, newClient]);
        
        // Seleccionar automáticamente el nuevo cliente
        this.selectedClientId.set(newClient._id!);
        
        // Cerrar modal y resetear formulario
        this.closeNewClientModal();
        this.resetNewClientForm();
        this.isSavingClient.set(false);
      },
      error: (error) => {
        console.error('Error al crear cliente:', error);
        toast.error(error.error?.detail || 'Error al crear cliente');
        this.isSavingClient.set(false);
      }
    });
  }

  getStockBadgeClass(stock: number, stockMinimo: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (stock <= stockMinimo) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Sin Stock';
    return `Stock: ${stock}`;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getClientFullName(client: Client): string {
    return `${client.nombres} ${client.apellidos}`;
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.loadProducts();
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    this.loadProducts();
  }

  onBrandChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBrand.set(value);
    this.loadProducts();
  }

  onClientChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedClientId.set(value);
  }

  onMetodoPagoChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as MetodoPago;
    this.metodoPago.set(value);
  }

  onDescuentoChange(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    if (value < 0) {
      this.descuentoPorcentaje.set(0);
    } else if (value > 100) {
      this.descuentoPorcentaje.set(100);
    } else {
      this.descuentoPorcentaje.set(value);
    }
  }

  onNewClientFieldChange(field: keyof Client, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newClient.update(client => ({ ...client, [field]: value }));
  }
}

