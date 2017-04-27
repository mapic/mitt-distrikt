var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('front-page');
});

// admin
router.get('/admin', function(req, res, next) {
    res.render('admin-page');
});

// // wildcard
// router.get('/*', function(req, res, next) {
//     res.render('index');
// });


module.exports = router;