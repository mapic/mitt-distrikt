var express = require('express');
var router = express.Router();


// root
router.get('/', function(req, res, next) {
    // console.log('Cookies: ', req.cookies);
    // console.log('Signed Cookies: ', req.signedCookies)
    res.render('index', { 
        title: 'Express',
        text : "Check this shit out!" 
    });
});

// admin
router.get('/admin', function(req, res, next) {
    res.render('admin', { 
        title: 'Admin',
        text : "Check this shit out!" 
    });
});

// // wildcard
// router.get('/*', function(req, res, next) {
//     res.render('index', { 
//         title: 'Wildcard',
//         text : "Check this shit out!" 
//     });
// });


module.exports = router;