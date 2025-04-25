import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CollectionService } from '../../services/collection/collection.service';
import { Collection } from '../../models/collection';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  userForm: FormGroup;
  userId!: string;
  isNotValid: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService : AuthService, private collectionService : CollectionService) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  // Sign up, navigate to login upon success
  onSubmit() {
    console.log(this.userForm.value);
    if (this.userForm.valid) {
      this.authService.createUser(this.userForm.value).subscribe({
        next: (res) => {
          this.userId = res.id;
          this.router.navigate(['/login']);
        },
        error: () => {
          console.log("Error creating user");
          this.isNotValid = true;
        }
      });
    }
  }
}
