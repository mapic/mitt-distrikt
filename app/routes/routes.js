var express = require('express');
var router = express.Router();

module.exports = router;

// home
router.get('/', function(req, res, next) {
    res.render('front-page');
});

// admin
router.get('/admin', function(req, res, next) {
    res.render('admin-page');
});


// login
router.post('/login', function (req, res, next) {

    // check user/pass and return access_token
    console.log('/login');
    console.log('body', req.body);

    res.send({
        access_token : 'debug_access_token',
        error : null
    });

    // todo: redis handling of access_tokens
    // todo: secure all sensitive endpoints with access_token verification
    // todo: don't use cookies on admin.

});


// debug
router.get('/debug', function(req, res, next) {
    res.render('debug');
});