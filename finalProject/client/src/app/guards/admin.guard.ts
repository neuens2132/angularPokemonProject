import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AlertService } from '../services/alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private alertService: AlertService) {}

  // Ensure user is admin and logged in
  canActivate(): boolean {
    console.log(this.authService.isLoggedIn());
    console.log(this.authService.isAdmin());
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/home']);
      this.alertService.showAlert('Your session has expired. Please log in again.', 'warning');
      return false;
    }
  }
}
