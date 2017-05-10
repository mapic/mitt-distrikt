
// redis store for layers
// var redis = require('redis').createClient('', 'redis');
// redis.on('error', function (err) {console.log('Redis error: ', err);});
// redis.auth(config.redis.layers.auth);

module.exports = {

    note : function (req, res) {
        console.log('api.note', req.body);

        res.send({
            err : null, 
            fn : 'api.note'
        })
    },

    upload : function (req, res) {

        console.log('post /v1/image', req);

        res.send({
            err : null,
            endpoint : '/v1/upload'
        });



    },

    login : function (req, res, next) {

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

    },



}
