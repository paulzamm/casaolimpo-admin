import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toast } from 'ngx-sonner';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { Brand } from '../../../core/models/brand.model';
import { environment } from '../../../../environments/environment';

declare const Modal: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  authService = inject(AuthService); // Public para usar en template
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  Math = Math;
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  
  // Filtros
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedBrand: string = '';
  selectedStockStatus: string = '';
  
  isLoading: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;

  // Modal
  productForm!: FormGroup;
  isEditMode: boolean = false;
  selectedProductId?: string;
  modal: any;
  deleteModal: any;
  productToDelete?: string;

  // Upload de imagen
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadProgress: number = 0;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      descripcion: [''],
      tallas: [''], // Será convertido a array
      colores: [''], // Será convertido a array
      imagen: ['']
    });
  }

  loadCategories(): void {
    this.categoryService.getAll({ skip: 0, limit: 1000 }).subscribe({
      next: (response) => {
        this.categories = response.items;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadBrands(): void {
    this.brandService.getAll({ skip: 0, limit: 1000 }).subscribe({
      next: (response) => {
        this.brands = response.items;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    const skip = (this.currentPage - 1) * this.itemsPerPage;
    
    this.productService.getAll({
      search: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      brand: this.selectedBrand || undefined,
      stock_status: this.selectedStockStatus || undefined,
      skip,
      limit: this.itemsPerPage
    }).subscribe({
      next: (response) => {
        // Forzar recarga de imágenes añadiendo timestamp a la URL
        this.products = (response.items || []).map(product => {
          let imagenUrl = product.imagen;
          if (imagenUrl && imagenUrl !== '') {
            // Remover timestamp anterior si existe
            imagenUrl = imagenUrl.split('?')[0];
            // Agregar nuevo timestamp
            imagenUrl = `${imagenUrl}?t=${Date.now()}`;
          }
          return {
            ...product,
            imagen: imagenUrl
          };
        });
        this.totalItems = response.total || 0;
        this.applyStockFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        toast.error('Error al cargar productos');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyStockFilter(): void {
    // Ya no es necesario filtrar localmente, el servidor lo hace
    this.filteredProducts = this.products;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadProducts();
  }

  onBrandChange(event: Event): void {
    this.selectedBrand = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadProducts();
  }

  onStockStatusChange(event: Event): void {
    this.selectedStockStatus = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadProducts();
  }

  getPaginatedProducts(): Product[] {
    // Todos los filtros se aplican en el servidor, solo retornamos los productos
    return this.products;
  }

  getStockStatus(stock: number): { text: string; class: string } {
    if (stock === 0) {
      return { text: 'Sin Stock', class: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/20 dark:text-red-400' };
    } else if (stock <= 10) {
      return { text: `Stock Bajo (${stock})`, class: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/20 dark:text-yellow-500' };
    } else {
      return { text: `En Stock (${stock})`, class: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400' };
    }
  }

  getCategoryName(categoriaValue: string): string {
    // Si es un nombre directamente, devolverlo
    if (!categoriaValue || categoriaValue.length !== 24 || /\s/.test(categoriaValue)) {
      return categoriaValue;
    }
    // Si parece un ID, buscar el nombre en la lista
    const category = this.categories.find(c => c._id === categoriaValue);
    return category?.nombre || categoriaValue;
  }

  getBrandName(marcaValue: string): string {
    // Si es un nombre directamente, devolverlo
    if (!marcaValue || marcaValue.length !== 24 || /\s/.test(marcaValue)) {
      return marcaValue;
    }
    // Si parece un ID, buscar el nombre en la lista
    const brand = this.brands.find(b => b._id === marcaValue);
    return brand?.nombre || marcaValue;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('Error loading image:', img.src);
    // Ocultar la imagen rota mostrando el placeholder
    img.style.display = 'none';
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedProductId = undefined;
    this.productForm.reset({
      precio: 0,
      stock: 0
    });
    this.imagePreview = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.openModal();
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product._id;
    
    // Buscar el ID de la categoría que coincida con el nombre
    // Si product.categoria ya es un ID válido, mantenerlo; si no, buscar por nombre
    let categoryId = product.categoria || '';
    let brandId = product.marca || '';
    
    // Si no es un ObjectId válido (tiene más de 24 caracteres o contiene espacios), buscar por nombre
    if (!categoryId || categoryId.length !== 24 || /\s/.test(categoryId)) {
      categoryId = this.categories.find(c => c.nombre === product.categoria)?._id || '';
    }
    
    if (!brandId || brandId.length !== 24 || /\s/.test(brandId)) {
      brandId = this.brands.find(b => b.nombre === product.marca)?._id || '';
    }
    
    this.productForm.patchValue({
      nombre: product.nombre,
      codigo: product.codigo,
      precio: product.precio,
      stock: product.stock,
      categoria: categoryId,
      marca: brandId,
      descripcion: product.descripcion || '',
      tallas: product.tallas?.join(', ') || '',
      colores: product.colores?.join(', ') || '',
      imagen: product.imagen || ''
    });
    this.imagePreview = product.imagen || null;
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.openModal();
  }

  openModal(): void {
    const modalElement = document.getElementById('productModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.modal = new Modal(modalElement);
      this.modal.show();
    }
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
    this.imagePreview = null;
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor seleccione un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no debe superar los 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.imagePreview = null;
    this.selectedFile = null;
    this.productForm.patchValue({ imagen: '' });
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) {
      return this.productForm.get('imagen')?.value || null;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    try {
      this.isUploading = true;
      this.uploadProgress = 0;

      const response = await this.http.post<{ url: string }>(
        `${environment.apiUrl}/api/admin/images/upload`,
        formData
      ).toPromise();

      // Progreso completo
      this.uploadProgress = 100;
      
      if (response && response.url) {
        return response.url;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.status === 401 || error.status === 403) {
        toast.error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      } else {
        toast.error(error.error?.detail || 'Error al subir la imagen');
      }
      return null;
    } finally {
      this.isUploading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Subir imagen si hay una seleccionada
    const imageUrl = await this.uploadImage();
    
    const formValue = this.productForm.value;
    
    // Convertir strings separados por comas a arrays
    const productData = {
      ...formValue,
      imagen: imageUrl || formValue.imagen || '',
      tallas: formValue.tallas ? formValue.tallas.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
      colores: formValue.colores ? formValue.colores.split(',').map((c: string) => c.trim()).filter((c: string) => c) : []
    };
    

    if (this.isEditMode && this.selectedProductId) {
      this.updateProduct(productData);
    } else {
      this.createProduct(productData);
    }
  }

  createProduct(data: any): void {
    this.productService.create(data).subscribe({
      next: () => {
        toast.success('Producto creado exitosamente');
        this.closeModal();
        // setTimeout para evitar NG0100 error
        setTimeout(() => this.loadProducts(), 0);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        toast.error(error.error?.detail || 'Error al crear producto');
      }
    });
  }

  updateProduct(data: any): void {
    if (!this.selectedProductId) return;
    
    this.productService.update(this.selectedProductId, data).subscribe({
      next: () => {
        toast.success('Producto actualizado exitosamente');
        this.closeModal();
        // setTimeout para evitar NG0100 error y forzar actualización de imágenes
        setTimeout(() => this.loadProducts(), 0);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        toast.error(error.error?.detail || 'Error al actualizar producto');
      }
    });
  }

  deleteProduct(id: string): void {
    this.productToDelete = id;
    this.openDeleteModal();
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.productService.delete(this.productToDelete).subscribe({
      next: () => {
        toast.success('Producto eliminado exitosamente');
        this.closeDeleteModal();
        this.productToDelete = undefined;
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        toast.error(error.error?.detail || 'Error al eliminar producto');
      }
    });
  }

  openDeleteModal(): void {
    const modalElement = document.getElementById('deleteProductModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.deleteModal = new Modal(modalElement);
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.productToDelete = undefined;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (!this.selectedStockStatus) {
        this.loadProducts();
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (!this.selectedStockStatus) {
        this.loadProducts();
      }
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    if (!this.selectedStockStatus) {
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
