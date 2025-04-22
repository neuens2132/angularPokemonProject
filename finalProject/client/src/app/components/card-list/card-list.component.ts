import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import * as bootstrap from 'bootstrap';
import { Card } from '../../models/card';
import { cardPrices } from '../../models/cardPrices';
import { CollectionService } from '../../services/collection/collection.service';
import { AuthService } from '../../services/auth/auth.service';
import { Collection } from '../../models/collection';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css'
})
export class CardListComponent {
  cards: Card[] = [];
  id!: string;
  setName: string = "";
  cardPrices: cardPrices = {
    normalMarket: null,
    holofoilMarket: null,
    reverseHolofoilMarket: null
  }
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';
  alertTimeout: any;
  loading = true;

  constructor(private route: ActivatedRoute, private pokemonApiService: PokemonApiService, private collectionService: CollectionService, private authService: AuthService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.pokemonApiService.getCardsInSet(this.id).subscribe({
      next: res => {
        console.log(res);
        res.map((card) => {
          this.cardPrices.normalMarket = card.tcgplayer?.prices?.normal?.market;
          this.cardPrices.holofoilMarket = card.tcgplayer?.prices?.holofoil?.market;
          this.cardPrices.reverseHolofoilMarket = card.tcgplayer?.prices?.reverseHolofoil?.market;

          this.cards.push({
            id: card.id,
            name: card.name,
            images: {
              small: card.images?.small,
              large: card.images?.large
            },
            price: this.cardPrices.normalMarket ? this.cardPrices.normalMarket : (this.cardPrices.holofoilMarket ? this.cardPrices.holofoilMarket : this.cardPrices.reverseHolofoilMarket),
            quantity: 1
          })
        })
        console.log(this.cards);
        this.setName = res[0].set.name;
        this.loading = false;
      }
    });
  }

  addToCollection(card: Card) {
    const userId = this.authService.getCurrentUser()!.id;
    this.collectionService.getCollection(userId!).subscribe({
      next: res => {
        console.log(res);
        let currentCollection: Collection = res;
        let cardExists = false;

        // Update existing card if found
        for (let i = 0; i < currentCollection.cards.length; i++) {
          if (currentCollection.cards[i].id === card.id) {
            currentCollection.cards[i].quantity += 1;
            cardExists = true;
            break;
          }
        }

        if (!cardExists) {
          // Make sure the card has a quantity property initialized
          const cardToAdd = { ...card, quantity: 1 };
          currentCollection.cards.push(cardToAdd);
        }

        this.collectionService.updateCollection(currentCollection).subscribe({
          next: res => {
            console.log(res);
            this.alertService.showAlert("Card added to collection");
          },
          error: () => {
            console.log("Error updating collection");
            this.alertService.showAlert("Error adding card to collection", "danger");
          }
        });
      },
      error: () => {
        console.log("Error getting collection");
      }
    });
  }
}
