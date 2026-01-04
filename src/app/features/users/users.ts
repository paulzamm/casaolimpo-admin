import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { UserService } from '../../core/services/user.service';
import { User, UserCreate, Role } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

declare const Modal: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(AuthService);

  Math = Math;
  Role = Role; // Exportar enum para usar en template
  users: User[] = [];
  allUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  isLoading: boolean = false;
  totalItems: number = 0;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  userForm!: FormGroup;
  isEditMode: boolean = false;
  selectedUserId?: string;
  modal: any;
  deleteModal: any;
  userToDelete?: string;

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      activo: [true]
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.userService.getAll().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        toast.error('Error al cargar usuarios');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allUsers];
    
    // Filtro por búsqueda (nombre, email)
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.nombres.toLowerCase().includes(search) ||
        u.apellidos.toLowerCase().includes(search) ||
        u.correo.toLowerCase().includes(search)
      );
    }
    
    // Filtro por rol
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.rol === this.selectedRole);
    }
    
    // Filtro por estado
    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(u => u.activo);
    } else if (this.selectedStatus === 'inactive') {
      filtered = filtered.filter(u => !u.activo);
    }
    
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1; // Reset a primera página
    
    // Aplicar paginación
    const start = 0;
    const end = this.itemsPerPage;
    this.users = filtered.slice(start, end);
  }

  applyPagination(): void {
    let filtered = [...this.allUsers];
    
    // Aplicar los mismos filtros
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.nombres.toLowerCase().includes(search) ||
        u.apellidos.toLowerCase().includes(search) ||
        u.correo.toLowerCase().includes(search)
      );
    }
    
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.rol === this.selectedRole);
    }
    
    if (this.selectedStatus === 'active') {
      filtered = filtered.filter(u => u.activo);
    } else if (this.selectedStatus === 'inactive') {
      filtered = filtered.filter(u => !u.activo);
    }
    
    // Aplicar paginación
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.users = filtered.slice(start, end);
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onRoleChange(event: Event): void {
    this.selectedRole = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  getUsers(): User[] {
    return this.users;
  }

  getUserFullName(user: User): string {
    return `${user.nombres} ${user.apellidos}`;
  }

  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case Role.VENDEDOR:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Admin';
      case Role.VENDEDOR:
        return 'Vendedor';
      default:
        return role;
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedUserId = undefined;
    this.userForm.reset({ activo: true });
    // En modo crear, password es requerido
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(3)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.openModal();
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.selectedUserId = user._id;
    this.userForm.patchValue({
      cedula: user.cedula,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
      rol: user.rol,
      activo: user.activo,
      password: '' // Limpiar el campo password explícitamente
    });
    // En modo editar, password es opcional
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.openModal();
  }

  openModal(): void {
    const modalElement = document.getElementById('userModal');
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
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const userData = this.userForm.value;

    if (this.isEditMode && this.selectedUserId) {
      // En edición, si password está vacío, no lo enviamos
      const updateData = { ...userData };
      if (!updateData.password) {
        delete updateData.password;
      }
      this.updateUser(updateData);
    } else {
      this.createUser(userData);
    }
  }

  createUser(data: UserCreate): void {
    this.userService.create(data).subscribe({
      next: () => {
        toast.success('Usuario creado exitosamente');
        this.closeModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        toast.error(error.error?.detail || 'Error al crear usuario');
      }
    });
  }

  updateUser(data: Partial<User>): void {
    if (!this.selectedUserId) return;
    
    this.userService.update(this.selectedUserId, data).subscribe({
      next: () => {
        toast.success('Usuario actualizado exitosamente');
        this.closeModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        toast.error(error.error?.detail || 'Error al actualizar usuario');
      }
    });
  }

  toggleUserStatus(user: User): void {
    if (!user._id) return;
    
    this.userService.toggleActive(user._id).subscribe({
      next: () => {
        toast.success(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        toast.error(error.error?.detail || 'Error al cambiar estado del usuario');
      }
    });
  }

  deleteUser(id: string): void {
    this.userToDelete = id;
    this.openDeleteModal();
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.userService.delete(this.userToDelete).subscribe({
      next: () => {
        toast.success('Usuario eliminado exitosamente');
        this.closeDeleteModal();
        this.userToDelete = undefined;
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        toast.error(error.error?.detail || 'Error al eliminar usuario');
      }
    });
  }

  openDeleteModal(): void {
    const modalElement = document.getElementById('deleteUserModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.deleteModal = new Modal(modalElement);
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.userToDelete = undefined;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
