import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Card } from '../../models/card';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth/auth.service';
import { CollectionService } from '../../services/collection/collection.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Collection } from '../../models/collection';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-collection',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css'
})
export class CollectionComponent {
  collection!: Collection;
  cards: Card[] = [];
  user!: User;
  searchForm!: FormGroup;
  totalPrice: number = 0;
  loading = true;
  searchValue: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private collectionService: CollectionService, private alertService: AlertService) {
    this.searchForm = new FormGroup({
      search: new FormControl('', Validators.required)
    });  
  }

  // Get collection
  ngOnInit(): void {
    this.user = this.authService.getCurrentUser()!;

    this.collectionService.getCollection(this.user.id!).subscribe({
      next: res => {
        this.collection = res;
        this.cards = res.cards;
        this.getTotalPrice();
        this.loading = false;
      },
      error: () => {
        console.log("Error getting collection");
      }
    })

  }

  // Search applied on cards in collection
  onSubmit() {
    this.loading = true;
    this.searchValue = this.searchForm.value.search;
    this.collectionService.getCollection(this.user.id!, this.searchValue).subscribe({
      next: res => {
        this.cards = res.cards;
        this.getTotalPrice();
        this.loading = false;
      },
      error: () => {
        console.log("Error getting collection");
        this.loading = false;
      }
    })
  }

  // Remove card from collection
  deleteCard(cardId: string) {
    const updatedCards = this.collection.cards.map(card => {
      // Simply decrease quantity if > 1 otherwise remove
      if (card.id === cardId) {
        if (card.quantity > 1) {
          return { ...card, quantity: card.quantity - 1 };
        }
        return null;
      }
      return card;
    }).filter(card => card !== null);
  
    // Update collection
    const newCollection: Collection = { ...this.collection, cards: updatedCards };
    this.collectionService.updateCollection(newCollection).subscribe({
      next: res => {
        this.collection = res;
        this.cards = res.cards;
        this.getTotalPrice();
        this.alertService.showAlert("Card removed from collection");
        this.searchForm.reset();
      },
      error: () => {
        this.alertService.showAlert("Error removing card from collection");
      }
    });
  }

  // Calculate total price
  getTotalPrice() {
    this.totalPrice = this.cards.reduce((acc, card) => {
      const price = card.price || 0;
      return acc + price * (card.quantity || 1);
    }, 0);
  }
}
