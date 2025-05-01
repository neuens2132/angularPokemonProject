var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Forum = require('../models/forum');

// GET all forums in set paginated
router.get('/', async (req, res) => {
    try {
        const { setId } = req.query;
        console.log(setId);

        if (!setId) {
            return res.status(400).json({ error: 'setId parameter is required' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 20;

        const skip = (page - 1) * limit;

        // sort by lastModified, paginated
        const allForums = await Forum.find({ setId: setId }).sort({ lastModified: -1 }).skip(skip).limit(limit);
        const total = await Forum.find({ setId: setId }).countDocuments();

        res.json({
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalForums: total,
            allForums
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new forum
router.post('/', async (req, res) => {
    try {
        const userId = req.user._id;
        const forum = await Forum.create({ 
            ...req.body,
            userFirstName: req.user.firstName,
            userLastName: req.user.lastName,
            userId: userId });
        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a single forum
router.get('/:id', async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Update a forum
router.put('/:id', async (req, res) => {
    try {
        const forum = await Forum.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        const userId = forum.userId;
        if(userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Delete a forum
router.delete('/:id', async (req, res) => {
    try {
        const forum = await Forum.findByIdAndDelete(req.params.id);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        const userId = forum.userId;
        if(userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;