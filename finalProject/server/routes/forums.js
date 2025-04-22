var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Forum = require('../models/forum');

router.get('/', async (req, res) => {
    try {
        const { setId } = req.query;
        console.log(setId);

        if (!setId) {
            return res.status(400).json({ error: 'setId parameter is required' });
        }

        const page = parseInt(req.query.page) || 1;
        console.log(page);
        const limit = 20;

        const skip = (page - 1) * limit;

        const allForums = await Forum.find({ setId: setId }).skip(skip).limit(limit);
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

router.post('/', async (req, res) => {
    try {
        const userId = req.user._id;
        const forum = await Forum.create({ ...req.body, userId });
        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

router.put('/:id', async (req, res) => {
    try {
        const forum = await Forum.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const forum = await Forum.findByIdAndDelete(req.params.id);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        res.json(forum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;