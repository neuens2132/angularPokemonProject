import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth/auth.service';
import * as bootstrap from 'bootstrap';
import { AlertComponent } from './components/shared/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    AlertComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title: any;
  constructor(public authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeTooltips();
      }
    });
  }

  initializeTooltips() {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => {
      const tooltip = new bootstrap.Tooltip(el);

      el.addEventListener('click', (event) => {
        tooltip.hide();
      })
    });
  }
}
