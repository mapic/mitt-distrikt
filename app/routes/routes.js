
// express
var express = require('express');
var router = express.Router();

// our api
var api = require('./api');

// home
router.get('/', api.index);

// admin
router.get('/admin', api.admin);

// serve images
router.get('/v1/image/:filename', api.image);

// get geojson
router.get('/v1/notes', api.getNotes);

// login
router.post('/login', api.login);

// post note
router.post('/v1/note', api.note);

// upload image
router.post('/v1/upload', api.upload);


module.exports = router;