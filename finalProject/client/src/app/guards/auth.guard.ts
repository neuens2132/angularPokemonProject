import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable, map, catchError, of, tap } from 'rxjs';
import { AlertService } from '../services/alert/alert.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private alertService: AlertService) {}

  // Ensure user is logged in
  canActivate(): Observable<boolean> | boolean {
    return this.authService.isStillLoggedIn().pipe(
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.authService.logout();
          this.router.navigate(['/home']);
          this.alertService.showAlert('Your session has expired. Please log in again.', 'warning');
        }
      })
    );
  }
}
