var User = require('./userModel');

// Initialize users (only called once on startup)
async function init() {
  try {
    const existingUsers = await User.countDocuments();
    
    if (existingUsers === 0) {
      console.log('Initializing users collection...');
      const userDb = [
        ["bilbo", "baggins"], 
        ["frodo", "baggins"], 
        ["gandalf", "123"]
      ];
      
      const users = userDb.map(([username, password]) => ({
        username,
        password
      }));
      
      await User.insertMany(users);
      console.log('Users successfully added to database');
    } else {
      console.log('Users collection already populated');
    }
  } catch (error) {
    console.error('Error initializing users:', error);
  }
}

// I might've never used these
async function saveUser(user) {
  return await new User(user).save();
}

async function findById(id) {
  return await User.findById(id);
}

async function findByUsername(username) {
  return await User.findOne({ username });
}

module.exports = { findByUsername, saveUser, findById, init };