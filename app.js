//require database file
require('./db.js');

//authentication requirements
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//passport file
require('./pass.js')(passport, LocalStrategy);

var authentication = require('./routes/authentication.js');
var braintree = require('./routes/braintree');

var routes = require('./routes/index');
var user = require('./routes/users');
var donations = require('./routes/donations');
var basket = require('./routes/basket');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
  secret: 'battlehack',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', user);
app.use('/donations', donations);
app.use('/basket', basket);

app.get('/client_token', braintree.client_token);

app.post('/authorize', braintree.authorize);

//authentication
app.get('/login', authentication.login);
app.get('/signup', authentication.signup);
app.post('/create_user', authentication.createUser);
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res){
    res.redirect('/');
    //return res.json({status:"ok", data:req.user});
  }
);

app.get('/logout', authentication.logout);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
