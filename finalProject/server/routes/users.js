var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Collection = require('../models/collection');
const bcrypt = require('bcryptjs');
const { default: mongoose } = require('mongoose');
const Forum = require('../models/forum');

// GET all users, paginated
router.get('/users', async (req, res) => {
  try {
    if(req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post('/register', async (req, res) => {
  try {
    const { password } = req.body;
    const newPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: newPassword });
    res.status(201).json(user);
  } catch (error) {
    console.error("User creation failed: ", error);
    res.status(400).json({ error: error.message });
  }
})

// Fetch a user based on userId
router.get('/users/:id', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);
    
    if((userId.toString() !== req.user._id.toString())) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Update a user based on userId
router.put('/users/:id', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);

    if((userId.toString() !== req.user._id.toString()) && req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Delete a user based on userId
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);

    console.log(req.user.role);
    if((userId.toString() !== req.user._id.toString()) && req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const forums = await Forum.deleteMany({ userId: req.params.id });

    const collection = await Collection.findOneAndDelete({ userId: req.params.id });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


module.exports = router;
