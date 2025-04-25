import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { PokemonApiService } from '../../services/pokemon/pokemon.service';
import { Card } from '../../models/card';
import { cardPrices } from '../../models/cardPrices';
import { CollectionService } from '../../services/collection/collection.service';
import { AuthService } from '../../services/auth/auth.service';
import { Collection } from '../../models/collection';
import { AlertService } from '../../services/alert/alert.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
  searchForm!: FormGroup
  searchValue: string = '';

  constructor(private route: ActivatedRoute, private pokemonApiService: PokemonApiService, private collectionService: CollectionService, private authService: AuthService, private alertService: AlertService) {
    this.searchForm = new FormGroup({
      search: new FormControl('', Validators.required)
    });
  }

  // Get cards in set
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

  // Search applied on cards
  onSubmit() {
    this.loading = true;
    this.cards = [];
    this.searchValue = this.searchForm.value.search;
    this.pokemonApiService.getCardsInSet(this.id, this.searchValue).subscribe({
      next: res => {
        res.map((card) => {
            const normalMarket = card.tcgplayer?.prices?.normal?.market;
            const holofoilMarket = card.tcgplayer?.prices?.holofoil?.market;
            const reverseHolofoilMarket = card.tcgplayer?.prices?.reverseHolofoil?.market;

            const price = normalMarket ?? holofoilMarket ?? reverseHolofoilMarket;

            this.cards.push({
            id: card.id,
            name: card.name,
            images: {
              small: card.images?.small,
              large: card.images?.large
            },
            price: price,
            quantity: 1
          })
        })
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.log("Error getting collection");
      }
    })
  }

  // Add card to collection pressed
  addToCollection(card: Card) {
    console.log("Card: ", card);
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

        // Ensure quantity is set to 1
        if (!cardExists) {
          const cardToAdd = { ...card, quantity: 1 };
          currentCollection.cards.push(cardToAdd);
        }

        // Update collection
        this.collectionService.updateCollection(currentCollection).subscribe({
          next: res => {
            this.alertService.showAlert("Card added to collection");
          },
          error: () => {
            this.alertService.showAlert("Error adding card to collection", "danger");
          }
        });
      },
      error: () => {
        this.alertService.showAlert("Error loading collection", "danger");
      }
    });
  }
}
