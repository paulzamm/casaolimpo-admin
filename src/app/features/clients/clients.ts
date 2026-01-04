import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';
import { AuthService } from '../../core/services/auth.service';

declare const Modal: any;

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(AuthService);

  Math = Math;
  clients: Client[] = [];
  allClients: Client[] = []; // Todos los clientes sin filtrar
  searchTerm: string = '';
  isLoading: boolean = false;
  totalItems: number = 0;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Modal
  clientForm!: FormGroup;
  isEditMode: boolean = false;
  selectedClientId?: string;
  modal: any;
  deleteModal: any;
  clientToDelete?: string;

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      correo: ['', [Validators.email]],
      direccion: [''],
      ciudad: ['']
    });
  }

  loadClients(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    this.clientService.getAll({ 
      search: this.searchTerm || undefined
    }).subscribe({
      next: (clients) => {
        this.allClients = clients;
        this.totalItems = clients.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.applyPagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        toast.error('Error al cargar clientes');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyPagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.clients = this.allClients.slice(start, end);
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadClients();
  }

  getClients(): Client[] {
    return this.clients;
  }

  getClientFullName(client: Client): string {
    return `${client.nombres} ${client.apellidos}`;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedClientId = undefined;
    this.clientForm.reset();
    this.openModal();
  }

  openEditModal(client: Client): void {
    this.isEditMode = true;
    this.selectedClientId = client._id;
    this.clientForm.patchValue({
      cedula: client.cedula,
      nombres: client.nombres,
      apellidos: client.apellidos,
      telefono: client.telefono || '',
      correo: client.correo || '',
      direccion: client.direccion || '',
      ciudad: client.ciudad || ''
    });
    this.openModal();
  }

  openModal(): void {
    const modalElement = document.getElementById('clientModal');
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
    if (this.clientForm.invalid) {
      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.get(key)?.markAsTouched();
      });
      return;
    }

    const clientData = this.clientForm.value;

    if (this.isEditMode && this.selectedClientId) {
      this.updateClient(clientData);
    } else {
      this.createClient(clientData);
    }
  }

  createClient(data: any): void {
    this.clientService.create(data).subscribe({
      next: () => {
        toast.success('Cliente creado exitosamente');
        this.closeModal();
        this.loadClients();
      },
      error: (error) => {
        console.error('Error creating client:', error);
        toast.error(error.error?.detail || 'Error al crear cliente');
      }
    });
  }

  updateClient(data: any): void {
    if (!this.selectedClientId) return;
    
    this.clientService.update(this.selectedClientId, data).subscribe({
      next: () => {
        toast.success('Cliente actualizado exitosamente');
        this.closeModal();
        this.loadClients();
      },
      error: (error) => {
        console.error('Error updating client:', error);
        toast.error(error.error?.detail || 'Error al actualizar cliente');
      }
    });
  }

  deleteClient(id: string): void {
    this.clientToDelete = id;
    this.openDeleteModal();
  }

  confirmDelete(): void {
    if (!this.clientToDelete) return;

    this.clientService.delete(this.clientToDelete).subscribe({
      next: () => {
        toast.success('Cliente eliminado exitosamente');
        this.closeDeleteModal();
        this.clientToDelete = undefined;
        this.loadClients();
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        toast.error(error.error?.detail || 'Error al eliminar cliente');
      }
    });
  }

  openDeleteModal(): void {
    const modalElement = document.getElementById('deleteClientModal');
    if (modalElement && typeof Modal !== 'undefined') {
      this.deleteModal = new Modal(modalElement);
      this.deleteModal.show();
    }
  }

  closeDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.hide();
    }
    this.clientToDelete = undefined;
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
