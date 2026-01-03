import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreate } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/admin/users`;

  getAll(params?: { skip?: number; limit?: number }): Observable<User[]> {
    let httpParams = new HttpParams();
    
    if (params?.skip !== undefined) httpParams = httpParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<User[]>(this.apiUrl, { params: httpParams });
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: UserCreate): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
