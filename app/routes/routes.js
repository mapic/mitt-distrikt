var express = require('express');
var router = express.Router();
var api = require('./api');

module.exports = router;

// home
router.get('/', function(req, res, next) {
    res.render('front-page');
});

// admin
router.get('/admin', function(req, res, next) {
    res.render('admin-page');
});

// post note
router.post('/v1/note', api.note);

// upload image
router.post('/v1/upload', api.upload);

// login
router.post('/login', api.login);


// debug
router.get('/debug', function(req, res, next) {
    res.render('debug');
});