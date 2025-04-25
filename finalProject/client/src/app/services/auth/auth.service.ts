import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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

  // Login and store user in local storage
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      })
    );
  }

  // Log out and remove user from local storage
  logout(): void {
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  // Locally check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  // Check if user is still logged in on server side
  verifySession(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}/check-auth`).pipe(
      map(response => response.authenticated),
      catchError(() => of(false))
    );
  }

  // Ensure user is still logged in from local storage or server
  isStillLoggedIn(): Observable<boolean> {
    if (!this.isLoggedIn()) {
      return of(false);
    }
    return this.verifySession();
  }

  // Grab user from local storage
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

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    console.log(user);
    return !!user && user.role === 'admin';
  }
}
