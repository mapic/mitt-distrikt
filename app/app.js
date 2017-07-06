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
var compression = require('compression');
var router = express.Router();

// our api
var api = require('./routes/api');

// set port
var port = 3001;

// create app
var app = express();

// use compression
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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

// route: home
router.get('/', api.index);

// route: admin
router.get('/admin', api.admin);

// route: serve images
router.get('/v1/image/:filename', api.image);

// route: get geojson
router.get('/v1/notes', api.getNotes);

// route: get geojson
router.get('/v1/table', api.getTable); // todo: check access_token

// route: login
router.post('/login', api.login);

// route: post note
router.post('/v1/note', api.note);

// route: delete note
router.post('/v1/delete', api.checkAccess, api.deleteNote);

// route: delete note
router.post('/v1/undo', api.undoNote);

// route: upload image
router.post('/v1/upload', api.upload);

// direct note
router.get('/v1/direct/:id', api.direct);

// export notes
router.get('/v1/export', api.exportNotes);

// config
router.get('/v1/config', api.getConfig);

// debug
router.get('/v1/debug', api.debugFeed);

// social media
router.get('/v1/social', api.socialMediaFeed);

// set config
router.post('/v1/config', api.checkAccess, api.setConfig);

// filter post
router.post('/v1/filterPost', api.checkAccess, api.filterPost);

// set routes
app.use('/', router);

// start server
app.listen(port, function () {
    console.log('Listening on port', port)
});
