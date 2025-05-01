var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var createError = require('http-errors');
var cors = require('cors');
var logger = require('morgan');

//temp for loading
var bcrypt = require('bcryptjs');
var { faker } = require('@faker-js/faker');
var User = require('./models/user');
var Collection = require('./models/collection');
var Forum = require('./models/forum');

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Routes
var authenticator = require('./routes/authenticator');
var index = require('./routes/index');
var guard = require('./routes/guard');
var user = require('./routes/users');
var forum = require('./routes/forums');
var collection = require('./routes/collections');
var pokemon = require('./routes/pokemon');

var app = express();

// App setup
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'Final Project Neuens',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    expires: 1000000,
    httpOnly: true,
    secure: false
  }
}));

// Database connection
mongoose.connect('mongodb://138.49.184.232:27017/final_project_neuens')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Could not connect to MongoDB', err));



// Authentication
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', index);
app.use('/', authenticator);
app.use('/api', user);
app.use('/api', guard);
app.use('/api/forums', forum);
app.use('/api/collection', collection);
app.use('/api/pokemon', pokemon);

app.use('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(3000, () => console.log("Server running on port 3000"));

module.exports = app;

