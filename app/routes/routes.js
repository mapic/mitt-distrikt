var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('front-page');
});

// admin
router.get('/admin', function(req, res, next) {
    res.render('admin-page');
});


// login
router.get('/login', function (req, res, next) {

    // check user/pass and return access_token
    

});

// // wildcard
// router.get('/*', function(req, res, next) {
//     res.render('index');
// });


module.exports = router;