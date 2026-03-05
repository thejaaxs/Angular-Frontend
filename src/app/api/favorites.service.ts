import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Favorite } from '../shared/models/favorite.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesApi {
  private base = `${environment.apiBaseUrl}/favorites`;

  constructor(private http: HttpClient) {}

  list(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.base}/list`);
  }

  add(fav: Favorite): Observable<string> {
    return this.http.post(`${this.base}/add`, fav, { responseType: 'text' });
  }

  updateByName(name: string, fav: Favorite): Observable<string> {
    return this.http.put(`${this.base}/updateByName?name=${encodeURIComponent(name)}`, fav, { responseType: 'text' });
  }

  deleteByName(name: string): Observable<string> {
    return this.http.delete(`${this.base}/deleteByName?name=${encodeURIComponent(name)}`, { responseType: 'text' });
  }

  deleteByProductName(product: string): Observable<string> {
    return this.http.delete(`${this.base}/deleteByProductName?product=${encodeURIComponent(product)}`, { responseType: 'text' });
  }

  listByReason(reason: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.base}/listByReason?reason=${encodeURIComponent(reason)}`);
  }

  byName(name: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.base}/byName?name=${encodeURIComponent(name)}`);
  }
}
