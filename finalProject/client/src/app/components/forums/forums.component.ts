import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ForumService } from '../../services/forum/forum.service';
import * as bootstrap from 'bootstrap';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { Forum } from '../../models/forum';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth/auth.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { AlertService } from '../../services/alert/alert.service';


@Component({
  selector: 'app-forums',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './forums.component.html',
  styleUrl: './forums.component.css'
})
export class ForumsComponent {
  forums: Forum[] = [];
  setId!: string;
  setName!: string;
  userId!: string;
  currentPage = 1;
  numPages = 0;
  visiblePages: (number | string)[] = [];
  loading = true;

  constructor(private route: ActivatedRoute, private forumService: ForumService, private pokemonApiServce : PokemonApiService, private authService : AuthService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.setId = this.route.snapshot.paramMap.get('id')!;
    this.userId = this.authService.getCurrentUser()!.id!;

    this.pokemonApiServce.getSet(this.setId).subscribe( {
      next: res => {
        console.log(res);
        this.setName = res.data.name;
      }
    });

    this.loadForumsWithUserData();
  }

  // Get all forums in set (pagination applied of course)
  loadForumsWithUserData(page: number = 1) {
    this.forumService.getSetForums(this.setId, page).subscribe({
      next: (res) => {
        console.log(res);
        this.forums = res.allForums;
        this.currentPage = res.page;
        this.numPages = res.totalPages;
        this.visiblePages = this.generateVisiblePages(this.currentPage, this.numPages);
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.alertService.showAlert("Error loading forums", "danger");
      }
    })
  }

  // Determine the numbers visible within pagination bar
  generateVisiblePages(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++){
        pages.push(i);
      };
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