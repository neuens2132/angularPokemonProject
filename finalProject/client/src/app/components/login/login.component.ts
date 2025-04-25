import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Collection } from '../../models/collection';
import { CollectionService } from '../../services/collection/collection.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule, 
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userForm: FormGroup;
  userId!: string;
  isNotValid: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService : AuthService, private collectionService : CollectionService) {
    this.userForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  // Login
  onSubmit() {
    console.log(this.userForm.value);
    if (this.userForm.valid) {
      this.authService.login(this.userForm.value.email, this.userForm.value.password).subscribe({
        next: () => {
          this.userId = this.authService.getCurrentUser()!.id!;
          const collection: Collection = {
            userId: this.userId,
            cards: []
          }
    
          this.collectionService.createCollection(collection).subscribe({
            next: (res1) => {
              console.log("Collection created");
              console.log(res1);
            },
            error: () => {
              console.log("Error creating collection");
            }
          });
          this.router.navigate(['/']);
        },
        error: () => {
          console.log("Error logging in");
          this.isNotValid = true;
        }
      });
    }
  }
}
