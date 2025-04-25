import { Component, OnInit } from '@angular/core';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { Set } from '../../models/set';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sets.component.html',
  styleUrl: './sets.component.css'
})
export class SetsComponent implements OnInit {
  sets: Set[] = [];
  groupedSets: { series: string; sets: Set[]; latestRelease: Date }[] = [];
  loading = true;

  constructor(private pokemonApiService: PokemonApiService) { }

  // Get all sets
  ngOnInit(): void {
    this.pokemonApiService.getSets().subscribe({
      next: response => {
        const groupedMap: { [series: string]: Set[] } = {};
  
        // Group sets by series
        response.data.forEach((set: Set) => {
          if (!groupedMap[set.series]) {
            groupedMap[set.series] = [];
          }
          groupedMap[set.series].push(set);
        });
  
        // Convert to array with release date info
        const groupedArray = Object.entries(groupedMap).map(([series, sets]) => {
          // Sort the sets within the series
          sets.sort((a, b) =>
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
          );
  
          return {
            series,
            sets,
            latestRelease: new Date(sets[0].releaseDate),
          };
        });
  
        // Sort the groups by latest release date (descending)
        groupedArray.sort(
          (a, b) => b.latestRelease.getTime() - a.latestRelease.getTime()
        );
  
        this.groupedSets = groupedArray;
        this.loading = false;
      },
      error: error => {
        console.error('Error fetching data', error);
      }
    });
  }
}
