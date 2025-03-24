var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var createError = require('http-errors');

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Routes
var authenticator = require('./routes/authenticator');
var index = require('./routes/index');
var guard = require('./routes/guard');
var meta = require('./routes/meta');
var games = require('./routes/games');
var userService = require('./routes/users');
var tokenService = require('./routes/tokens');

var app = express();

// App setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'connectour four',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    expires: 60000,
    httpOnly: true,
    secure: false
  }
}));

// Database connection
mongoose.connect('mongodb://138.49.184.232:27017/hw_03')
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
app.use('/api', guard);
app.use('/api/v1/meta', meta);
app.use('/api/v1/games', games)

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
