#!/usr/bin/env node

// load modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var debug = require('debug')('app:server');

// set routes
var routes = require('./routes/routes');

// set port
var port = 3001;

// create app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set logger
app.use(logger('dev'));

// set parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set cookie parser
app.use(cookieParser());

// set favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// set public path
app.use(express.static(path.join(__dirname, 'public')));

// harden security
app.use(helmet());
app.disable('x-powered-by');

// set routes
app.use('/', routes);

// middleware, check access_token
app.use(function (err, req, res, next) {

    console.log('middelware access token!');

    next();

});







// start server
app.listen(port, function () {
    console.log('Listening on port', port)
});



















