import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonApiService {

  private apiUrl = '/api/pokemon';

  constructor(private http: HttpClient) { }

  getSets(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sets`);
  }

  getCardsInSet(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/cards?setId=${id}`)
      .pipe(
        map(res => res.data)
      );
  }

  getCard(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cards/${id}`);
  }

  getSet(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sets/${id}`);
  }

}
