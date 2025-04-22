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

  // When a user selects on the collection page.
  getCollection(userId: string, searchValue?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`, { params: { searchValue: searchValue ?? "" } });
  }

  // When a user creates an account.
  createCollection(collection: Collection): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${collection.userId}`, collection);
  }

  // When clicking the button on a given card's info.
  updateCollection(collection: Collection): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${collection.userId}`, collection);
  }

  // Will be deleted when a user is deleted.
  deleteCollection(collection: Collection): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${collection.userId}`);
  } 

}
