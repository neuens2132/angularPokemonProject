import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  apiUrl = '/api/forums';

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  getSetForums(setId: string, page?: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}`, { params: { setId: setId } });
  }

  createForum(forum: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, forum);
  }

  getForum(forumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${forumId}`);
  }

  updateForum(forum: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${forum.forumId}`, forum);
  }

  deleteForum(forum: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${forum.forumId}`);
  }

}
