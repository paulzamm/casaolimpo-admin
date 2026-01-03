import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { BrandService } from '../../../core/services/brand.service';
import { Brand } from '../../../core/models/brand.model';

declare const Modal: any;

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class Brands implements OnInit {
  private brandService = inject(BrandService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  Math = Math; // Para usar en template
  brands: Brand[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  totalItems: number = 0;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  brandForm!: FormGroup;
  isEditMode: boolean = false;
  selectedBrandId?: string;
  modal: any;
  deleteModal: any;
  brandToDelete?: string;

  ngOnInit(): void {
    this.initForm();
    this.loadBrands();
  }

  initForm(): void {
    this.brandForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
  }

  loadBrands(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    const skip = (this.currentPage - 1) * this.itemsPerPage;
    
    this.brandService.getAll({ skip, limit: this.itemsPerPage }).subscribe({
      next: (response) => {
        this.brands = response.items;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        toast.error('Error al cargar marcas');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    // TODO: Implementar búsqueda en el servidor
  }

  getBrands(): Brand[] {
    return this.brands;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedBrandId = undefined;
    this.brandForm.reset();
    this.openModal();
  }

  openEditModal(brand: Brand): void {
    this.isEditMode = true;
    this.selectedBrandId = brand._id;
    this.brandForm.patchValue({
      nombre: brand.nombre,
      descripcion: brand.descripcion || ''
    });
    this.openModal();
  }

  openModal(): void {
    const modalElement = document.getElementById('brandModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.modal = new Modal(modalElement);
      this.modal.show();
    }
  }

  closeModal(): void {
    if (this.modal) {
      this.modal.hide();
    }
  }

  onSubmit(): void {
    if (this.brandForm.invalid) {
      Object.keys(this.brandForm.controls).forEach(key => {
        this.brandForm.get(key)?.markAsTouched();
      });
      return;
    }

    const brandData = this.brandForm.value;

    if (this.isEditMode && this.selectedBrandId) {
      this.updateBrand(brandData);
    } else {
      this.createBrand(brandData);
    }
  }

  createBrand(data: any): void {
    this.brandService.create(data).subscribe({
      next: () => {
        toast.success('Marca creada exitosamente');
        this.closeModal();
        this.loadBrands();
      },
      error: (error) => {
        console.error('Error creating brand:', error);
        toast.error(error.error?.detail || 'Error al crear marca');
      }
    });
  }

  updateBrand(data: any): void {
    if (!this.selectedBrandId) return;
    
    this.brandService.update(this.selectedBrandId, data).subscribe({
      next: () => {
        toast.success('Marca actualizada exitosamente');
        this.closeModal();
        this.loadBrands();
      },
      error: (error) => {
        console.error('Error updating brand:', error);
        toast.error(error.error?.detail || 'Error al actualizar marca');
      }
    });
  }

  deleteBrand(id: string): void {
    this.brandToDelete = id;
    this.openDeleteModal();
  }

  confirmDelete(): void {
    if (!this.brandToDelete) return;

    this.brandService.delete(this.brandToDelete).subscribe({
      next: () => {
        toast.success('Marca eliminada exitosamente');
        this.closeDeleteModal();
        this.brandToDelete = undefined;
        this.loadBrands();
      },
      error: (error) => {
        console.error('Error deleting brand:', error);
        toast.error(error.error?.detail || 'Error al eliminar marca');
      }
    });
  }

  openDeleteModal(): void {
    const modalElement = document.getElementById('deleteBrandModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.deleteModal = new Modal(modalElement);
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.brandToDelete = undefined;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBrands();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBrands();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBrands();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
