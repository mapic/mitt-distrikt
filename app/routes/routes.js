
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

// get geojson
router.get('/v1/table', api.getTable); // todo: check access_token

// login
router.post('/login', api.login);

// post note
router.post('/v1/note', api.note);

// delete note
router.post('/v1/delete', api.deleteNote);

// upload image
router.post('/v1/upload', api.upload);


module.exports = router;