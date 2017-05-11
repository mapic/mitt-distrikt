var fs = require('fs-extra');
var GJV = require("geojson-validation");
var shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-');
var config = require('../app-config.js');
var redis = require('redis').createClient({
    host : 'redis'
});
redis.on('error', function (err) {console.log('Redis error: ', err);});
// redis.auth(config.redis.layers.auth);

// storage handler
var multer = require('multer');

// helpers
safeStringify = function (o) {try {var s = JSON.stringify(o);return s;} catch (e) {return false;}}
safeParse = function (s) {try { var o = JSON.parse(s); return o; } catch (e) {return false;}}



module.exports = api = {

    // route: /v1/upload
    upload : function (req, res) {
        console.log('post /v1/upload');

        // create unique file id
        var file_id = shortid.generate();

        // filename
        var filename;

        // multer: create storage
        var storage = multer.diskStorage({
            destination: function(req, file, callback) {
                callback(null, '/uploads');
            },
            filename: function(req, file, callback) {
                var ext;
                if (file.mimetype == 'image/jpeg') ext = '.jpg';
                if (file.mimetype == 'image/png') ext = '.png';
                filename = file_id + ext;
                callback(null, filename);
            }
        });

        // multer: create uploader
        var upload = multer({ 
            storage: storage,
            limits : { fileSize : 11000000 } // 10 MB
        }).single('file');

        // store to disk
        upload(req, res, function (err, something) {
            if (err) {
                return res.send({err : "Couldn't upload image!"});
            }

            // create image url
            var image_url = 'https://mittlier.no/v1/image/' + filename;

            // return to client
            res.send({
                err : null, 
                endpoint : '/v1/upload',
                image_url : image_url
            })
        });

    },

    // route: /v1/image/:filename
    image : function (req, res) {

        // get id
        var path = '/uploads/' + req.params.filename;

        // read file and send to client
        fs.readFile(path, function (err, image) {
            res.set('Content-Type', 'image/png'); // todo: more specific?
            res.send(image);
        });
    },


    // route: GET /
    index : function (req, res) {
        res.render('front-page');
    },

    // route: GET /admin
    admin : function (req, res) {
        res.render('admin-page');
    },

    // route: POST /v1/note
    note : function (req, res) {

        // get options
        var options = req.body;

        // get feature
        var feature = options.feature;

        // check valid feature
        var valid_feature = api._checkValidFeature(feature);

        // if not valid
        if (!valid_feature) {
            return res.send({
                err : 'Invalid Feature. This is not your fault.'
            });
        }

        // get existing geojson
        redis.get(config.redis.geojson, function (err, json) {
            if (err) {
                console.log('api.note -> redis.get -> error: ', err);
                return res.send({
                    err : err
                });
            }

            // parse
            var existing_geojson = safeParse(json);

            // ensure geojson exists
            if (!existing_geojson) {
                var existing_geojson = {
                  "type": "FeatureCollection",
                  "features": []
                }
            }

            // add feature to existing
            existing_geojson.features.push(feature);

            // save to redis
            redis.set(config.redis.geojson, safeStringify(existing_geojson), function (err) {

                // return to client 
                res.send({
                    err : err, 
                    feature : feature,
                    fn : 'api.note',
                });
            });
            
        });

    },

    // route: GET /v1/notes
    getNotes : function (req, res) {
        // get existing geojson
        redis.get(config.redis.geojson, function (err, json) {
            if (err) {
                console.log('api.note -> redis.get -> error: ', err);
                return res.send({
                    err : err
                });
            }

            // parse
            var existing_geojson = safeParse(json);

            // send
            res.send(existing_geojson);
        });
    },

    _checkValidFeature : function (feature) {

        var geojson = {
          "type": "FeatureCollection",
          "features": [feature]
        };

        // check valid geojson
        var valid_geojson = GJV.valid(geojson);

        // todo: check for other content

        // return
        return valid_geojson;
    },




    // route: /login
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
