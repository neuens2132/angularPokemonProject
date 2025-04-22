import { Card } from "./card";

export interface Collection{
    id?: string;
    userId: string;
    cards: Card[];
}