var express = require('express');
var router = express.Router();
var apiUrl = 'https://api.pokemontcg.io/v2';

// GET all sets
router.get('/sets', async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/sets`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single set based on id
router.get('/sets/:id', async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/sets/${req.params.id}`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all of the cards in a single set
router.get('/cards', async (req, res) => {
    try {
        const { setId } = req.query;

        if (!setId) {
            return res.status(400).json({ error: 'setId parameter is required' });
        }

        const response = await fetch(`${apiUrl}/cards?q=set.id:${setId}`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a single card based on id
router.get('/cards/:id', async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/cards/${req.params.id}`);
        const data = await response.json();
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;