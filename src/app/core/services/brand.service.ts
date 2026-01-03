import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand } from '../models/brand.model';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/brands`;

  getAll(params?: { skip?: number; limit?: number }): Observable<PaginatedResponse<Brand>> {
    let httpParams = new HttpParams();
    
    if (params?.skip !== undefined) httpParams = httpParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<PaginatedResponse<Brand>>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/${id}`);
  }

  create(brand: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(this.apiUrl, brand);
  }

  update(id: string, brand: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/${id}`, brand);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
