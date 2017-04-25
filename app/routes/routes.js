var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // console.log('Cookies: ', req.cookies);
    // console.log('Signed Cookies: ', req.signedCookies)
    res.render('index', { 
        title: 'Express',
        text : "Check this shit out!" 
    });
});

router.get('/admin', function(req, res, next) {
    // console.log('Cookies: ', req.cookies);
    // console.log('Signed Cookies: ', req.signedCookies)
    res.render('admin', { 
        title: 'Admin',
        text : "Check this shit out!" 
    });
});


module.exports = router;
