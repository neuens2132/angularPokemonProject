var express = require('express');
var router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Authentication, username is email.
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (email === user.email && isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }
));
 
 passport.serializeUser((user, done) => {
   console.log(`serialize user (${user})`);
   done(null, user._id );
 });
 
 passport.deserializeUser(async (_id, done) => {
   console.log(`deserialize user (${_id})`);
   const user = await User.findOne({_id});
   if ( user ) {
     done(null, user);
   } else {
     done(new Error('User not found'));
   }
 });

 router.post('/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
    if(req.isAuthenticated()) {
      return res.status(200).json(req.user);
    }

    res.status(401).json({ message: 'Unauthorized' });
  });
 
 router.post('/logout', (req, res) => {
   req.logout((err) => {
     if (err) {
       return res.status(500).json({ message: 'Server side error on logout' });
     }
     res.json({ message: 'Logged out successfully' });
   });
 });

 // Check if user is authenticated
 router.get('/check-auth', (req, res) => {
   if (req.isAuthenticated()) {
     return res.status(200).json({ authenticated: true, user: req.user });
   }
   res.status(200).json({ authenticated: false });
 });
 
module.exports = router;