import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-user-table',
  imports: [RouterModule, CommonModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css'
})
export class UserTableComponent {
  users!: User[];
  currentPage = 1;
  numPages = 0;
  visiblePages: (number | string)[] = [];
  loading = true;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  // Toggle user status
  toggleStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const newUser = { ...user, status: newStatus };

    this.authService.updateUser(newUser).subscribe({
      next: (res) => {
        console.log(res);
        user.status = newStatus;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Delete user
  onDelete(id: string) {
    this.loading = true;
    this.authService.deleteUser(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.getUsers();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      }
    });
  }

  // Get users
  getUsers(page: number = 1): void {
    this.loading = true;
    this.authService.getUsers(page).subscribe({
      next: (res) => {
        console.log(res);
        this.users = res.users;
        this.currentPage = res.page;
        this.numPages = res.totalPages;
        this.visiblePages = this.generateVisiblePages(this.currentPage, this.numPages);
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // Determine the numbers visible within pagination bar
  generateVisiblePages(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) {
        if (i > 1 && i < total) pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  }
}
