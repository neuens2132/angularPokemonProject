import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ForumService } from '../../services/forum/forum.service';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { Forum } from '../../models/forum';

@Component({
  selector: 'app-forum-update',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './forum-update.component.html',
  styleUrl: './forum-update.component.css'
})
export class ForumUpdateComponent {
  forumId!: string;
  setName!: string;
  forumForm!: FormGroup;
  setId!: string;
  loading = true;

  constructor(private fb: FormBuilder, private router: Router, private forumService : ForumService, private route: ActivatedRoute, private pokemonApiServce : PokemonApiService) {
    this.forumForm = this.fb.group({
      forumId: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  // Populate update page with the forum chosen to be updated
  ngOnInit(): void {
    this.forumId = this.route.snapshot.paramMap.get('id')!;
    this.forumService.getForum(this.forumId).subscribe({
      next: (forum) => {
        this.setId = forum.setId;
        this.forumForm.patchValue({
          forumId: this.forumId,
          title: forum.title,
          description: forum.description
        });

        this.pokemonApiServce.getSet(this.setId).subscribe({
          next: res => {
            this.setName = res.data.name;
            this.loading = false;
          }
        });
      }
    })
  }

  // Update forum
  onSubmit() {
    this.loading = true;

    if (this.forumForm.valid) {
      const updatedForum = {
        ...this.forumForm.value,
        lastModified: new Date()
      }
      this.forumService.updateForum(updatedForum).subscribe({
        next: () => {
          this.router.navigate(['/sets', this.setId, 'forums']);
          this.loading = false;
        },
        error: () => {
          console.log("Error creating user");
        }
      });
    }
  }

  // Delete forum
  onDelete() {
    this.forumService.deleteForum(this.forumForm.value).subscribe({
      next: () => {
        this.router.navigate(['/sets', this.setId, 'forums']);
      },
      error: () => {
        console.log("Error creating user");
      }
    });
  }
}
