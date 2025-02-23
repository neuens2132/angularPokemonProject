const { v4: uuidv4 } = require('uuid');
const defaultMagicCard = 'https://www.pngkit.com/png/full/145-1458847_magic-card-png-magic-the-gathering-blank-card.png';

var XToken;
var usernameGlobal;

const cardsTable = {};
var userTable = [
    {
        id: 1,
        username: "bilbo",
        password: "baggins"
    },
    {
        id: 2,
        username: "frodo",
        password: "baggins"
    },
    {
        id: 3,
        username: "gandalf",
        password: "123"
    }
];
const userRatingsTable = {};

function Card( id, name, kind, description, imageUrl) {
    this.id = id;
    this.name = name;
    this.kind = kind;
    this.description = description;
    this.imageUrl = imageUrl;
}

function UserRating( rating, cardId, username) {
    this.rating = rating;
    this.cardId = cardId;
    this.username = username;
}

function contains( text, key ) {
    return text.toUpperCase().indexOf( key.toUpperCase() ) >= 0;
}

function matchesFilter( card, filter ) {
    return contains(card.name, filter);
}

function getCards(filter) {
    let result = Object.values(cardsTable);

    if(filter) {
        result = result.filter( card => matchesFilter(card, filter));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
}


function createPokemonCards( cards ) {
    const curCardsTable = {}
    cards ? cards.map(card => {
        let text = card.flavorText ? card.flavorText : "There was no flavor.";
        let result = new Card(card.id, card.name, "POKEMON", text, card.images.small);
        cardsTable[ result.id ] = result;
        curCardsTable[ result.id ] = result;
        if(!userRatingsTable[ usernameGlobal ][ card.id ])  {
            userRatingsTable[ usernameGlobal ][ card.id ] = new UserRating(0, card.id, usernameGlobal);
        }
    }) : null;
    return curCardsTable;
}

function createMagicCards( cards ) {
    const curCardsTable = {}
    cards ? cards.map(card => {
        let text = card.oracle_text;
        let image = card.image_uris ? card.image_uris.normal : defaultMagicCard;
        let result = new Card(card.id, card.name, "MTG", text, image);
        cardsTable[ result.id ] = result;
        curCardsTable[ result.id ] = result;
        if(!userRatingsTable[ usernameGlobal ][ card.id ])  {
            userRatingsTable[ usernameGlobal ][ card.id ] = new UserRating(0, card.id, usernameGlobal);
        }
    }) : null;
    return curCardsTable;
}

function getCardData( cardId ) {
    return cardsTable[ cardId ];
}

function initializeUserRating( cardId ) {
    let result = new UserRating(cardId, 0, )
}

function isValidUser( username, password ) {
    const user = userTable.find(u => u.username === username && u.password === password);

    if(user) {
        usernameGlobal = username;
        if(!userRatingsTable[ usernameGlobal ]) {
            userRatingsTable[ usernameGlobal ] = {};
        }
        console.log(userRatingsTable);
        XToken = uuidv4();
        return XToken
    }

    return null;
}

function getRating(cardId, username) {
    return userRatingsTable[username]?.[cardId]?.rating;
}

function updateRating(cardId, newRating, username) {
    let desiredCard = userRatingsTable[username]?.[cardId];
    if(desiredCard) {
        desiredCard.rating = newRating;
    }

    return desiredCard.rating;
}

module.exports = { createMagicCards, createPokemonCards, initializeUserRating, getCards, getCardData, getRating, updateRating, isValidUser, XToken, usernameGlobal };
