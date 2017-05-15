var config = require('../../app-config.js');
var generator = require('generate-password');
var redis = require('redis').createClient({host : 'redis'});
redis.on('error', function (err) {console.log('Redis error: ', err);});
redis.auth(config.redis.auth);

// helpers
safeStringify = function (o) {try {var s = JSON.stringify(o);return s;} catch (e) {return false;}}
safeParse = function (s) {try { var o = JSON.parse(s); return o; } catch (e) {return false;}}

// create user
var email = process.argv[2];

// check
if (!email) {
    console.log('Usage: node create-admin.js user@email.com');
    process.exit(1);
};

// create password
var password = generator.generate({
    length: 10,
    numbers: true
});

// create entry
var entry = {
    email : email,
    password : password
};

// save new user
// nb: this is a rather rough implementation, which will overwrite 
// existing user accounts if existing email is given.
redis.set(email, safeStringify(entry), function (err) {
    if (err) {
        console.log('There was an error.', err);
        process.exit(1);
    }
    console.log('');
    console.log('Created user!'); 
    console.log('');
    console.log('Login to /admin with:')
    console.log('User: ', email);
    console.log('Password: ', password);
    process.exit(0);

});