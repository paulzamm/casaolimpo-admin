import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, SaleCreate } from '../models/sale.model';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/sales`;

  // Obtener listado de ventas con filtros
  getSales(params?: { 
    search?: string;
    skip?: number; 
    limit?: number;
    start_date?: string;
    end_date?: string;
    metodo_pago?: string;
  }): Observable<Sale[]> {
    let httpParams = new HttpParams();
    
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.skip !== undefined) httpParams = httpParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.start_date) httpParams = httpParams.set('start_date', params.start_date);
    if (params?.end_date) httpParams = httpParams.set('end_date', params.end_date);
    if (params?.metodo_pago) httpParams = httpParams.set('metodo_pago', params.metodo_pago);

    return this.http.get<Sale[]>(this.apiUrl, { params: httpParams });
  }

  // Obtener detalle de una venta
  getById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva venta
  create(sale: SaleCreate): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale);
  }

  // Dashboard stats
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  getTopProducts(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/top-products`, {
      params: { limit: limit.toString() }
    });
  }
}
