import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '';
  private user? : User;
  private userKey = "user";

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: User) => {
        this.user = response;
        localStorage.setItem(this.userKey, JSON.stringify(this.user));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/users/${id}`);
  }

  createUser(user: User): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/api/register`, user);
  }

  getUsers(page: number): Observable<{ page: number, limit: number, totalPages: number, totalUsers: number, users: User[]}> {
    return this.http.get<{ page: number, limit: number, totalPages: number, totalUsers: number, users: User[]}>(`${this.apiUrl}/api/users?page=${page}`);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/api/users/${user.id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/users/${id}`);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    console.log(user);
    return !!user && user.role === 'admin';
  }
}
