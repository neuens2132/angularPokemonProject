import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Collection } from '../../models/collection';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  apiUrl = '/api/collection'

  constructor(private http: HttpClient) { }

  getCollection(userId: string, searchValue?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`, { params: { searchValue: searchValue ?? "" } });
  }

  createCollection(collection: Collection): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${collection.userId}`, collection);
  }

  updateCollection(collection: Collection): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${collection.userId}`, collection);
  }

  deleteCollection(collection: Collection): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${collection.userId}`);
  } 

}
