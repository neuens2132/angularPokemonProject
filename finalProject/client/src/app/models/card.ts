export interface Card {
    id?: string;
    name: string;
    images?: { small?: string, large?: string };
    price: number | null;
    quantity: number;
}