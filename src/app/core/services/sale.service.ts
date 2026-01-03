import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, SaleCreate } from '../models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/sales`;

  getHistory(params?: { skip?: number; limit?: number }): Observable<Sale[]> {
    let httpParams = new HttpParams();
    
    if (params?.skip !== undefined) httpParams = httpParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<Sale[]>(`${this.apiUrl}/history`, { params: httpParams });
  }

  getById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

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
