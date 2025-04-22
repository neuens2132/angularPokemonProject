var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Collection = require('../models/collection');
const mongoose = require('mongoose');

router.get('/:id', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);
        const filter = req.query.searchValue;

        if (!userId) {
            return res.status(400).json({ error: 'userId parameter is required' });
        }

        const curCollection = await Collection.findOne({ userId });
        if (!curCollection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        let filteredCards = curCollection.cards;
        if (filter && filter.trim() !== '') {
            filteredCards = filteredCards.filter(card =>
                card.name.toLowerCase().includes(filter.toLowerCase())
            );
        }

        const responseCollection = {
            ...curCollection.toObject(),
            cards: filteredCards
        };

        res.json(responseCollection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id', async (req, res) => {
    try {
        const existingCollection = await Collection.findOne({ userId: req.params.id });
        if (existingCollection) {
            return res.status(400).json({ error: 'Collection already exists' });
        }
        
        const collection = await Collection.create(req.body);
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.put('/:id', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);
        console.log(req.body);
        console.log(userId);

        const collection = await Collection.findOneAndUpdate( {userId: userId} , req.body, { new: true });
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.params.id);
        console.log(userId);

        const collection = await Collection.findOneAndDelete( {userId: userId} );
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


module.exports = router;