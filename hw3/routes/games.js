var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Game = require('./gameModel');
var Token = require('./tokenModel');
const Theme = require('./themeModel');

// Check if color is a valid hex color
function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6})$/.test(color);
}

// GET all games
router.get('/', async function(req, res, next) {
    let userId = req.user._id;
    console.log(userId);
    let games = await Game.find( { playerId: userId } );
    let themeIds = games.map(game => game.theme);
    let themes = await Theme.find( { _id: { $in: themeIds } } );

    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        const theme = themes.find(theme => theme._id.toString() === game.theme.toString());
        const playerToken = await Token.findOne({ _id: theme.playerToken });
        const computerToken = await Token.findOne({ _id: theme.computerToken });
        theme.playerToken = playerToken;
        theme.computerToken = computerToken;
        game.theme = theme;
    }

    if( req.isAuthenticated() ) {
        res.status(200).json(games);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// POST new game
router.post('/', async function(req, res, next) {
    const { color, playerTokenName, computerTokenName } = req.body;
    if(!isValidHexColor(color)) {
        return res.status(400).json({ message: 'Invalid color' });
    }

    const playerToken = await Token.findOne({ name: playerTokenName });
    if( !playerToken ) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    const computerToken = await Token.findOne({ name: computerTokenName });
    if( !computerToken ) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    const theme = new Theme({
        playerId: req.user._id,
        color,
        playerToken: playerToken._id,
        computerToken: computerToken._id
    });
    await theme.save()

    const game = new Game({
        playerId: req.user._id,
        theme: theme._id
    });
    await game.save();

    const finalTheme = await Theme.findOne({ _id: theme._id });
    const playerTokenObj = await Token.findOne({ _id: finalTheme.playerToken });
    const computerTokenObj = await Token.findOne({ _id: finalTheme.computerToken });
    finalTheme.playerToken = playerTokenObj;
    finalTheme.computerToken = computerTokenObj;

    if( req.isAuthenticated() ) {
        res.status(200).json({
            game,
            theme: finalTheme
        });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// GET specific game based on id
router.get('/:id', async function(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    const game = await Game.findOne({ _id: req.params.id });
    const theme = await Theme.findOne({ _id: game.theme });
    const playerToken = await Token.findOne({ _id: theme.playerToken });
    const computerToken = await Token.findOne({ _id: theme.computerToken });
    theme.playerToken = playerToken;
    theme.computerToken = computerToken;
    game.theme = theme;

    if( req.isAuthenticated() ) {
        res.status(200).json(game);
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// POST update a given game with a move
router.post('/:id', async function(req, res, next) {
    const { move, player } = req.body;
    const gameId = req.params.id;
    if(move < 0 || move > 6) {
        return res.status(200).json({ message: 'Invalid move' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid id' });
    }

    try {
        const game = await Game.findOne({ _id: gameId });

        let row = -1;
        for(let i = 4; i >= 0; i--) {
            if(!game.grid[i][move]) {
                row = i;
                break;
            }
        }

        if(row === -1) {
            return res.status(200).json({ message: 'Invalid move' });
        }

        game.grid[row][move] = player;

        const theme = await Theme.findOne({ _id: game.theme });
        const playerToken = await Token.findOne({ _id: theme.playerToken });
        const computerToken = await Token.findOne({ _id: theme.computerToken });
        theme.playerToken = playerToken;
        theme.computerToken = computerToken;
        game.theme = theme._id;

        if(checkStatus(game.grid)) {
            if(player === 'player') {
                game.status = 'VICTORY';
            } else {
                game.status = 'LOSS';
            }
            game.end = Date.now();
            await game.save();
            return res.status(200).json({
                game,
                theme
            });
        }

        if(checkTie(game.grid)) {
            game.status = 'TIE';
            game.end = Date.now();
            await game.save();
            return res.status(200).json({
                game,
                theme
            });
        }
        await game.save();

        return res.status(200).json({
            game,
            theme
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Check to see if all values are the same
function checkLine(a, b, c, d) {
    return (a !== null && a !== undefined && a !== 0 && a !== '') && (a === b) && (a === c) && (a === d);
}

// Check to see if there is a win
function checkStatus(grid) {
    // Check down
    let r = 0;
    let c = 0;
    for(r = 0; r < 2; r++) {
        for(c= 0; c < 7; c++) {
            if(checkLine(grid[r][c], grid[r+1][c], grid[r+2][c], grid[r+3][c])) {
                return true;
            }
        }
    }

    // Check right
    for(r = 0; r < 5; r++) {
        for(c= 0; c < 4; c++) {
            if(checkLine(grid[r][c], grid[r][c+1], grid[r][c+2], grid[r][c+3])) {
                return true;
            }
        }
    }

    // Check down-right
    for(r = 0; r < 2; r++) {
        for(c= 0; c < 4; c++) {
            if(checkLine(grid[r][c], grid[r+1][c+1], grid[r+2][c+2], grid[r+3][c+3])) {
                return true;   
            }
        }
    }

    // Check down-left
    for(r = 0; r < 2; r++) {
        for(c= 3; c < 7; c++) {
            if(checkLine(grid[r][c], grid[r+1][c-1], grid[r+2][c-2], grid[r+3][c-3])) {
                return true;
            }
        }
    }

    return false;
}

// Check to see if there is a tie
function checkTie(grid) {
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[i].length; j++) {
            if(!grid[i][j]) {
                return false;
            }
        }
    }
    return true;
}

module.exports = router;