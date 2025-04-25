import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { CollectionService } from '../../services/collection/collection.service';
import { AuthService } from '../../services/auth/auth.service';
import { Collection } from '../../models/collection';
import { Card } from '../../models/card';
import { cardPrices } from '../../models/cardPrices';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-card-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.css'
})
export class CardDetailsComponent {
  card!: Card;
  cardPrices: cardPrices = {
    normalMarket: null,
    holofoilMarket: null,
    reverseHolofoilMarket: null
  }
  cardId: string = '';
  seriesName: string = '';
  setName: string = '';
  loading = true;

  constructor(private route: ActivatedRoute, private pokemonApiService: PokemonApiService, private collectionService: CollectionService, private authService: AuthService, private alertService: AlertService) {}

  // Get card details based on card id
  ngOnInit(): void {
    this.cardId = this.route.snapshot.paramMap.get('id')!;
    this.pokemonApiService.getCard(this.cardId).subscribe({
      next: res => {
        console.log(res);
        this.seriesName = res.data.set.series;
        this.setName = res.data.set.name;
        this.cardPrices.normalMarket = res.data.tcgplayer?.prices?.normal?.market;
        this.cardPrices.holofoilMarket = res.data.tcgplayer?.prices?.holofoil?.market;
        this.cardPrices.reverseHolofoilMarket = res.data.tcgplayer?.prices?.reverseHolofoil?.market;
        const card : Card = {
          id: res.data.id,
          name: res.data.name,
          images: {
            small: res.data.images?.small,
            large: res.data.images?.large
          },
          price: this.cardPrices.normalMarket ? this.cardPrices.normalMarket : (this.cardPrices.holofoilMarket ? this.cardPrices.holofoilMarket : this.cardPrices.reverseHolofoilMarket),
          quantity: 1
        }
        this.card = card;
        console.log(this.card);
        this.loading = false;
      }
    });
  }

  // Add to collection button was pressed
  addToCollection() {
    const userId = this.authService.getCurrentUser()!.id;
    this.collectionService.getCollection(userId!).subscribe({
      next: res => {
        console.log(res);
        let currentCollection: Collection = res;
        let cardExists = false;
        
        // Update existing card if found in collection
        for (let i = 0; i < currentCollection.cards.length; i++) {
          if (currentCollection.cards[i].id === this.card.id) {
            currentCollection.cards[i].quantity += 1;
            cardExists = true;
            break;
          }
        }
        
        // Ensure quantity is set to 1
        if (!cardExists) {
          const cardToAdd = {...this.card, quantity: 1};
          currentCollection.cards.push(cardToAdd);
        }
  
        // Update collection
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
        this.alertService.showAlert("Error loading collection", "danger");
      }
    });
  }
}
