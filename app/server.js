// webserver

// load modules
var express = require('express');
var helmet = require('helmet')
var cookieParser = require('cookie-parser')

// create app
var app = express();

// use cookies
// https://github.com/expressjs/cookie-parser#example
app.use(cookieParser())

// harden security
app.use(helmet());
app.disable('x-powered-by')

// set port
var port = 3001;


// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    console.log('Cookies: ', req.cookies);
    console.log('Signed Cookies: ', req.signedCookies)
    res.send('hello world')
});

app.listen(port, function () {
    console.log('Example app listening on port', port)
});

