import { Injectable } from '@angular/core';
// import { Alert } from 'bootstrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface Alert {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alerts = new BehaviorSubject<Alert[]>([]);
  private nextId = 1;

  getAlerts(): Observable<Alert[]> {
    return this.alerts.asObservable();
  }

  showAlert(message: string, type: 'success' | 'danger' | 'warning'  = 'success'): void {
    const id = this.nextId++;
    const alert: Alert = { id, message, type };
    
    const currentAlerts = this.alerts.getValue();
    this.alerts.next([...currentAlerts, alert]);

    setTimeout(() => {
      this.removeAlert(id);
    }, 5000);
  }

  removeAlert(id: number): void {
    const currentAlerts = this.alerts.getValue();
    this.alerts.next(currentAlerts.filter(alert => alert.id !== id));
  }
}
