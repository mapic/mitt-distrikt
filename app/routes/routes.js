var express = require('express');
var router = express.Router();

module.exports = router;


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

});

