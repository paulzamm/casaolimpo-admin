import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

declare const Modal: any;

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  Math = Math; // Para usar en template
  categories: Category[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  totalItems: number = 0;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  categoryForm!: FormGroup;
  isEditMode: boolean = false;
  selectedCategoryId?: string;
  modal: any;
  deleteModal: any;
  categoryToDelete?: string;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    const skip = (this.currentPage - 1) * this.itemsPerPage;
    
    this.categoryService.getAll({ 
      search: this.searchTerm || undefined,
      skip, 
      limit: this.itemsPerPage 
    }).subscribe({
      next: (response) => {
        this.categories = response.items;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        toast.error('Error al cargar categorías');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadCategories();
  }

  getCategories(): Category[] {
    return this.categories;
    return this.categories;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategoryId = undefined;
    this.categoryForm.reset();
    this.openModal();
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.selectedCategoryId = category._id;
    this.categoryForm.patchValue({
      nombre: category.nombre,
      descripcion: category.descripcion || ''
    });
    this.openModal();
  }

  openModal(): void {
    const modalElement = document.getElementById('categoryModal');
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
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    const categoryData = this.categoryForm.value;

    if (this.isEditMode && this.selectedCategoryId) {
      this.updateCategory(categoryData);
    } else {
      this.createCategory(categoryData);
    }
  }

  createCategory(data: any): void {
    this.categoryService.create(data).subscribe({
      next: () => {
        toast.success('Categoría creada exitosamente');
        this.closeModal();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        toast.error(error.error?.detail || 'Error al crear categoría');
      }
    });
  }

  updateCategory(data: any): void {
    if (!this.selectedCategoryId) return;
    
    this.categoryService.update(this.selectedCategoryId, data).subscribe({
      next: () => {
        toast.success('Categoría actualizada exitosamente');
        this.closeModal();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        toast.error(error.error?.detail || 'Error al actualizar categoría');
      }
    });
  }

  deleteCategory(id: string): void {
    this.categoryToDelete = id;
    this.openDeleteModal();
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.categoryService.delete(this.categoryToDelete).subscribe({
      next: () => {
        toast.success('Categoría eliminada exitosamente');
        this.closeDeleteModal();
        this.categoryToDelete = undefined;
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        toast.error(error.error?.detail || 'Error al eliminar categoría');
      }
    });
  }

  openDeleteModal(): void {
    const modalElement = document.getElementById('deleteCategoryModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.deleteModal = new Modal(modalElement);
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.categoryToDelete = undefined;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadCategories();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
