import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/clients`;

  getAll(params?: { search?: string; skip?: number; limit?: number }): Observable<Client[]> {
    let httpParams = new HttpParams();
    
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.skip !== undefined) httpParams = httpParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<Client[]>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: string, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchByCedula(cedula: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/cedula/${cedula}`);
  }
}
