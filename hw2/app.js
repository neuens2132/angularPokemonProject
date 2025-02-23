var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cardService = require('./services/card-service');
const { resourceLimits } = require('worker_threads');

var app = express();
var PORT = 3000

const pokemonApiHeaders = {
  'X-Api-Key': '535b27c3-24b2-443f-8456-09113f3a3422',
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// Get cards based on the query from both apis
app.get('/api/v1/cards', async (req, res, next) => {
  const query = req.query.search;
  const XToken = req.headers['x-token'];

  try {
    const pokemonUrl = `https://api.pokemontcg.io/v2/cards?q=name:*${query}*&orderBy=name`;
    const pokemonResponse = await fetch(pokemonUrl);
    const pokemonData = await pokemonResponse.json();

    var pokemonResult = cardService.createPokemonCards(pokemonData.data);

    const magicUrl = `https://api.scryfall.com/cards/search?q=name:*${query}*&order=name`;
    const magicResponse = await fetch(magicUrl);
    const magicData = await magicResponse.json();

    var magicResult = cardService.createMagicCards(magicData.data);

    var filter = req.query.search || '';
    var newResult = cardService.getCards(filter);

    if(pokemonResult && magicResult && XToken) {
      res.status(200).json( { cards: newResult } );
    } else {
      res.status(400);
    }
  } catch (e) {
    console.log(e);
  }
});

// Login the user if the user is valid
app.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  var XToken = cardService.isValidUser(username, password);
  usernameGlobal = username;
  if(XToken) {
    res.status(200).json({ message: "Login successful.", headers: {"X-Token" : XToken}});
  } else {
    res.status(400).json({ message: "Authentication failure."});
  }
})

// Logout the user
app.post('/logout', async (req, res, next) => {
  XToken = null;
  usernameGlobal = null;
  res.status(200).json({ message: 'Logged out successfully.'});
})

// Grab data for an individual card
app.get('/api/v1/cards/:cardid', async (req, res, next) => {
  var result = cardService.getCardData(req.params.cardid);
  res.json( result );
});

// Grab the card's rating data
app.get('/api/v1/cards/:cardId/rating', async (req, res, next) => {
  const XToken = req.headers['x-token'];
  var result = cardService.getRating(req.params.cardId, usernameGlobal);
  if (XToken) {
    res.status(200).json( { Rating: result } );
  } else {
    res.status(400).send( { message: "No other data is returned. This occurs if the TOKEN is not valid." } );
  }
});

// Change the card's rating data
app.post('/api/v1/cards/:cardId/rating', async (req, res, next) => {
  const XToken = req.headers['x-token'];
  const { Rating } = req.body;
  var result = cardService.updateRating(req.params.cardId, Rating, usernameGlobal);
  if (XToken) {
    res.status(200).json( { Rating: result } );
  } else {
    res.status(400).send( { message: "No other data is returned. This occurs if the TOKEN is not valid." } );
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

module.exports = app;
