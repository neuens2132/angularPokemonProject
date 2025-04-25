import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../services/alert/alert.service';
import { CommonModule } from '@angular/common';
import { Alert } from '../../../services/alert/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(private alertService: AlertService) { }

  // Initialize alerts
  ngOnInit(): void {
    this.alertService.getAlerts().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Close alert
  closeAlert(id: number): void {
    this.alertService.removeAlert(id);
  }
}
