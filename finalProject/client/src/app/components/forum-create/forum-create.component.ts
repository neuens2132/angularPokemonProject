import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ForumService } from '../../services/forum/forum.service';

@Component({
  selector: 'app-forum-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './forum-create.component.html',
  styleUrl: './forum-create.component.css'
})
export class ForumCreateComponent {
  setId!: string;
  setName!: string;
  forumForm!: FormGroup;
  loading = true;

  constructor(private fb: FormBuilder, private router: Router, private forumService : ForumService, private route: ActivatedRoute, private pokemonApiServce : PokemonApiService) { }

  ngOnInit(): void {
    this.setId = this.route.snapshot.paramMap.get('id')!;
    this.pokemonApiServce.getSet(this.setId).subscribe( {
      next: res => {
        console.log(res);
        this.setName = res.data.name;
        this.loading = false;
      }
    });

    this.forumForm = this.fb.group({
      setId: [this.setId, Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
    })
  }

  onSubmit() {
    console.log(this.forumForm.value);
    if (this.forumForm.valid) {
      this.forumService.createForum(this.forumForm.value).subscribe({
        next: () => {
          this.router.navigate(['/sets', this.setId, 'forums']);
        },
        error: () => {
          console.log("Error creating user");
        }
      });
    }
  }
}
