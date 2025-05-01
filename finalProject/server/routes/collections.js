var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Collection = require('../models/collection');
const mongoose = require('mongoose');


// GET'S a collection based on userId
router.get('/:id', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);
        const filter = req.query.searchValue;

        if (!userId) {
            return res.status(400).json({ error: 'userId parameter is required' });
        }
        
        if(userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized' });
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

// Create a new collection for a user based on userId
router.post('/:id', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);

        if(userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const existingCollection = await Collection.findOne({ userId: userId });
        if (existingCollection) {
            return res.status(400).json({ error: 'Collection already exists' });
        }
        
        const collection = await Collection.create(req.body);
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Update a collection based on userId
router.put('/:id', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.id);
        
        if(userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const collection = await Collection.findOneAndUpdate( {userId: userId} , req.body, { new: true });
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Delete a collection based on userId
router.delete('/:id', async (req, res) => {
    try {
        const userId = mongoose.Types.ObjectId(req.params.id);

        if(userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

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