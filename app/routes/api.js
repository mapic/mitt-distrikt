var fs = require('fs-extra');
var GJV = require("geojson-validation");
var generator = require('generate-password');
var _ = require('lodash');
var shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-');
var config = require('../app-config.js');
var redis = require('redis').createClient({ host : 'redis' });
redis.on('error', function (err) { console.log('Redis error: ', err); });
redis.auth(config.redis.auth);
var sizeOf = require('image-size');
var json2csv = require('json2csv');
var nodemailer = require('nodemailer');
var ExifImage = require('exif').ExifImage;
var ig = require('instagram-node').instagram();
ig.use({ access_token: '21416541.ba4c844.8efa3e551006456fb59330eadb7f2c41' });
var async = require('async');


// storage handler
var multer = require('multer');

// instagram schedule
var schedule = require('node-schedule');
var j = schedule.scheduleJob('*/5 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
  api.schedule();
});

// helpers
safeStringify = function (o) {try {var s = JSON.stringify(o);return s;} catch (e) {return false;}}
safeParse = function (s) {try { var o = JSON.parse(s); return o; } catch (e) {return false;}}

// module
module.exports = api = {

    schedule : function () {

        // pull insta
        api.pullLatestInstagram();
    },

    debugFeed : function (req, res, next) {
        res.send({
            debugFeed : true
        })
    },

    filterPost : function (req, res, next) {

        var post_id = req.body.post_id;
        var filtered = req.body.filtered;

        if (!post_id) return res.send({err : 'Missing post_id'});

        var key = 'social-media-' + post_id;
        redis.get(key, function (err, post) {
            if (err) {
                return res.send({err : 'Missing post_id'});
            };

            var parsed = safeParse(post);

            parsed.filtered = filtered;

            redis.set(key, safeStringify(parsed), function (err) {

                if (err) return res.send({err : 'Missing post_id'});
                res.send({
                    err : null
                });
            });

        }.bind(this));

    },

    socialMediaFeed : function (req, res, next) {

        var show_filter = req.query.filter;

        // - get posts
        // - filter 
        redis.keys('social-media-*', function (err, keys) {

            // return null if no keys
            if (!_.size(keys)) {
                return res.send({
                    posts : []
                });
            };

            var posts = [];

            async.each(keys, function (key, callback) {

                redis.get(key, function (err, post) {
                    if (err) {
                        return callback();
                    }

                    posts.push(safeParse(post));
                    callback();
                });

            }, function (err) {

                var filtered_posts = _.filter(posts, function (p) {
                    return p.filtered == false;
                });

                if (show_filter == 'all') {
                    filtered_posts = posts;
                }

                res.send({
                    posts : filtered_posts
                });


            });


        });
    },
    
    pullLatestInstagram : function () {

        // 1. get data from insta
        // 2. put into ordered format
        // 3. save to redis, one by one
        // 4. maintain list in redis of active posts
        // 5. filter out from list any unwanted posts


        // get data from insta
        ig.tag_media_recent('mittlier', function(err, medias, pagination, remaining, limit) {

            // clean up
            var instagram_posts = [];
            _.each(medias, function (m) {
    
                var post = {
                    source : 'instagram',
                    id : m.id,
                    username : m.user.username,
                    full_name : m.user.full_name,
                    avatar : m.user.profile_picture,
                    created_time : m.created_time,
                    text : m.caption.text,
                    type : m.type,
                    image : m.images,
                    video : m.video,
                    link : m.link,
                    location : m.location,
                    likes : m.likes,
                    tags : m.tags,
                    filtered : false // key for filtering out posts, false by default
                }

                // check for existing key in redis
                var social_key = 'social-media-' + m.id;
                redis.get(social_key, function (err, result) {
                    if (err || !result) {
                    
                        // new post
                        redis.set(social_key, safeStringify(post), function (err) {
                            if (err) {
                                // console.log('failed to save to redis!');
                            } else {
                                console.log('saved', social_key, ' to redis!');
                            }
                        })

                    } 
                });

            })

        });

    },

    createDefaultConfig : function (done) {
        var defaultConfig = {
            hashtag : 'MittLier'
        };

        api._setConfig(defaultConfig, function (err) {
            done(err, defaultConfig);
        });
    },

    _getConfig : function (done) {
        redis.get(config.redis.config, function (err, result) {
            if (err) return done(err);
            if (!result) {
                api.createDefaultConfig(done);
            } else {
                done(err, safeParse(result));
            }
        });
    },

    _setConfig : function (app_config, done) {
        redis.set(config.redis.config, safeStringify(app_config), done);
    },

    setConfig : function (req, res, next) {
        var options = req.body;

        // get current config
        api._getConfig(function (err, app_config) {
            if (err) return res.send({error : err});

            // only allow valid optiosn
            _.each(options, function (v, k) {
                if (_.has(app_config, k)) {
                    app_config[k] = v;
                }
            });

            // save
            api._setConfig(app_config, function (err) {
                res.send({ error : err });
            });
        });
    },

    getConfig : function (req, res, next) {

        api._getConfig(function (err, app_config) {
            if (err || !app_config) {
                api.createDefaultConfig(function (err, app_config) {
                    return res.send({
                        error : err,
                        config : app_config
                    });
                });

            } else {
                res.send({
                    error : null, 
                    config : app_config
                });
            }
        });
    },

    exportNotes : function (req, res, next) {   
         
        // get all geojson
        api._getAllNotesAsGeoJSON(function (err, geojson) {
            var features = geojson.features;
            var data = [];

            // parse into csv friendly format
            var fields = ['title', 'text', 'address', 'username', 'tags', 'image', 'timestamp', 'geo', 'id'];
            _.each(features, function (f) {
                var p = f.properties;
                data.push({
                    title : p.title,
                    text : p.text,
                    address : p.address,
                    username : p.username,
                    tags : p.tags.join(' '),
                    image : p.image ? p.image.original : null,
                    timestamp : p.timestamp,
                    id : p.id,
                    geo : f.geometry.coordinates.join(' ')
                });
            })

            // parse to csv
            try {
                var result = json2csv({ data: data, fields: fields });
            } catch (err) {
                var result = 'Det oppstod en feil ved eksportering. Vennligst prøv igjen, eller kontakt webansvarlig på knutole@mapic.io.';
            }

            // return as file download
            res.setHeader('Content-disposition', 'attachment; filename=latest.csv');
            res.set('Content-Type', 'text/csv');
            res.status(200).send(result);
        });
    },

    twitter : function (options, done) {

        // var Twitter = require('twitter');
        // var twitterClient = new Twitter({
        //     consumer_key: config.twitter.consumer_key,
        //     consumer_secret: config.twitter.consumer_secret,
        //     access_token_key: config.twitter.access_token_key,
        //     access_token_secret: config.twitter.access_token_secret,
        // });


        // twitterClient.get('search/tweets', {q: 'mittlier'}, function(error, tweets, response) {
        //     console.log(tweets);
        //     done && done();
        // });

    },

    checkAccess : function (req, res, next) {

        // get access token
        var access_token = req.body.access_token;

        // deny if no token
        if (!access_token) return res.send(api.noAccess)
        
        // check access token
        redis.get(access_token, function (err, token) {

            // if no token
            if (err || !token) return res.send(api.noAccess);

            // parse
            var parsed_token = safeParse(token);

            // ensure token
            if (!parsed_token) return res.send(api.noAccess);

            // check privilege = admin
            var priv = parsed_token.privilege;
            if (priv != 'admin') return res.send(api.noAccess);

            // access granted
            next()
        });

    },
    noAccess : {
        error : 'Invalid or missing access token'
    },

    // route: /v1/upload
    upload : function (req, res) {

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
            if (err) return res.send({error : "Couldn't upload image!"});

            var file = req.file;
            var disk_path = file.path;
            var opts = req.body;
            var watermark_filename = file.filename + '.watermarked.jpg';

            var sizeOf = require('image-size');
            sizeOf(disk_path, function (err, dimensions) {
            
                var options = {
                    input : disk_path,
                    size : 400,
                    watermark : '/entrypoint/public/stylesheets/watermark.png',
                    output : '/uploads/' + watermark_filename,
                    quality : 90,
                    dimensions : dimensions
                };

                api._addWatermark(options, function (err, results) {

                    // create image url
                    var image_url = 'https://' + config.domain + '/v1/image/' + file.filename;
                    var watermark_url = 'https://' + config.domain + '/v1/image/' + watermark_filename;

                    api._getEXIF({
                        image : disk_path,
                    }, function (err, results) {
                        var rotate = err ? 0 : results.rotate;

                        // return to client
                        res.send({
                            error : null,
                            endpoint : '/v1/upload',
                            image : {
                                original : image_url,
                                watermark : image_url,
                                // watermark : watermark_url,
                                type : dimensions.type,
                                width : dimensions.width,
                                height : dimensions.height,
                                rotate : rotate
                            }
                        });

                    })

                });
            });
        });
    },

    _getEXIF : function (options, done) {
        var image = options.image;

        try {
            new ExifImage({ image : image }, function (err, exifData) {
                if (err) return done(err);
                
                // set
                var rotate = 0;
                switch(exifData.image.Orientation) {
                    case 8:
                        rotate = 270;
                        break;
                    case 3:
                        rotate = 180;
                        break;
                    case 6:
                        rotate = 90;
                        break;
                }

                done(null, {
                    rotate : rotate, 
                    exif : exifData
                });
            });
        } catch (e) {
            return done(e);
        }
    },

    _addWatermark : function (options, done) {

        // debug: turn off watermarking
        return done();
        
        // todo: async: https://www.npmjs.com/package/threads#basic-usage
        var dimensions = options.dimensions;
        var x = 0;
        var y = dimensions.height - 100; // on bottom

        var images = require("images");
        images(fs.readFileSync(options.input))                 
        .draw(images(options.watermark), x, y)        
        .saveAsync(options.output, 2, {                       
            quality : options.quality                       
        }, done);

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
        res.render('front-page', {
            fb_app_id : config.facebook.app_id,
            image_url : 'https://' + config.domain + '/stylesheets/facebook-logo.png',
            og_type : 'website',
            url : 'https://' + config.domain,
            main_title : config.facebook.title,
        });
    },

    // route: GET /admin
    admin : function (req, res) {
        res.render('admin-page');
    },

    // route: GET /direct/:id
    direct : function (req, res) {
        
        var id = req.params.id;

        api._getFeature(id, function (err, feature) {
            if (err) return res.send({error : err});

            // parse
            var f = safeParse(feature);
            if (!f) return api.index(req, res);

            var p = f.properties;
            var image = p.image;

            // set image
            var image_url = image ? image.watermark : 'https://' + config.domain + '/stylesheets/facebook-logo.png';

            // render page
            res.render('front-page', {
                id : p.id,
                image_url : image_url,
                fb_app_id : config.facebook.app_id,
                title : p.title,
                text : p.text,
                url : 'https://' + config.domain + '/v1/direct/' + p.id,
                main_title : config.facebook.title,
                og_type : 'article',
            });

        });
    },

    _getFeature : function (id, done) {
        var key = config.redis.key + '-' + id;
        redis.get(key, done);
    },

    _saveFeature : function (feature, done) {

        // check valid feature
        if (!feature || !api._checkValidFeature(feature) || !feature.properties) return done({error : '#149 Invalid feature'});

        // get key
        var key = config.redis.key + '-' + feature.properties.id;
        redis.set(key, safeStringify(feature), done);
    },

    // route: POST /v1/note
    note : function (req, res) {

        // get options
        var options = req.body;

        if (!options) return res.send({error : '#144 Invalid options'});

        // save feature
        api._saveFeature(options.feature, function (err, result) {
            if (err) return res.send({error : err});

            // send email notification
            api._sendEmail({
                props : options.feature.properties
            }, function (err) {
                if (err) console.log(err);
            });

            res.send({
                error : err, 
                feature : options.feature,
                fn : 'api.note',
            });
        });

    },

    _emptyGeoJSON : function () {
        return {
          "type": "FeatureCollection",
          "features": []
        };
    },

    _getAllNotesAsGeoJSON : function (done) {

        // get keys
        var key = config.redis.key + '-*' ;
        redis.keys(key, function (err, list) {
            if (err || !list || !list.length) return done(null, api._emptyGeoJSON());

            // get list of keys
            redis.mget(list, function (err, mlist) {
                if (err) return done(null, api._emptyGeoJSON())

                // geojson base
                var geojson = {
                  "type": "FeatureCollection",
                  "features": []
                };

                // parse
                _.each(mlist, function (m) {
                    geojson.features.push(safeParse(m));
                });

                // check valid
                if (!GJV.valid(geojson)) return done('#226 Invalid GeoJSON')

                // return
                done(null, geojson);

            });
        });
    },

    // route: GET /v1/notes
    getNotes : function (req, res) {
       api._getAllNotesAsGeoJSON(function (err, geojson) {
            if (err) return res.send({error : err});
            res.send(geojson);
       });
    },

    _deleteNoteById : function (id, done) {
        if (!id) return done('No such note id.');
        var key = config.redis.key + '-' + id ;
        redis.del(key, done);
    },

    deleteNote : function (req, res) {

        // get note id
        var note_id = req.body.id;

        // delete
        api._deleteNoteById(note_id, function (err, result) {
            res.send({error : err});
        });

    },

    undoNote : function (req, res) {
         // get note id
        var note_id = req.body.id;

        // delete. todo: only undo, since not admin
        api._deleteNoteById(note_id, function (err, result) {
            res.send({error : err});
        });
    },

    // rout: GET /v1/table
    getTable : function (req, res) {

        api._getAllNotesAsGeoJSON(function (err, geojson) {
            if (err) return res.send({error : err});

            // check if ANY notes exist
            if (!geojson || !_.size(geojson) || !geojson.features) {
                return res.send();
            };

            // parse into table format
            var table = [];
            _.each(geojson.features, function (feature) {

                // add properties and geometry
                var table_entry = feature.properties;
                table_entry.coordinates = feature.geometry.coordinates;

                // push to stack
                table.push(table_entry);
            
            });

            // send
            res.send(table);
        });

    },

    _checkValidFeature : function (feature) {

        var geojson = {
          "type": "FeatureCollection",
          "features": [feature]
        };

        // check valid geojson
        var valid = GJV.valid(geojson);

        // todo: check for other keys
        if (!feature.properties.id) valid = false;

        // return
        return valid;
    },

    _createEmailHTML : function (t) {
        
        // header
        var html = '<div style="background: #e74549; height: auto; width: 90%; border: 1px solid #e74549; color: white; padding: 10px; font-size: 1.3em">'
        html += config.email.subject,
        html += '</div>';

        // body
        html += '<div style="color: black; padding: 10px; width: 90%; padding-top: 20px; border: 1px solid #e74549;">';
        
            // title
            html += '<div style="font-weight: 500; font-size: 1.4em;">';
            html += t.title;
            html += '</div>';

            // text
            html += '<div style="padding-top: 5px;">';
            html += t.text;
            html += '</div>';

            // iamge
            if (t.image) {
                html += '<div style="padding-top: 5px;">';
                html += '<img src="' + t.image.original + '" style="max-width: 200px; max-height: 200px;">';
                html += '</div>';
            }

            // username
            html += '<div style="padding-top: 15px; color: gray;">';
            html += 'Skrevet av: ' + t.username;
            html += '</div>';

            // address
            html += '<div style="padding-top: 15px; color: gray;">';
            html += 'Sted: ' + t.address;
            html += '</div>';

        html += '</div>';

        // admin
        html += '<div style="color: black; padding: 10px; border: width: 90%; 1px solid #e74549; border-top: none;">';

            html += '<div>';
            html += 'Gå til <a href="https://' + config.domain + '/admin" target="_blank">admin-siden</a> for å inspisere innlegget.';
            html += '</div>';

        html += '</div>';

        // support email
        html += '<div style="color:gray; padding-top:10px;font-size:0.9em;font-style:italic;">Dette er en automatisk generert email. Kontakt <a style="color: gray;" href="mailto:hello@mapic.io?subject=Support for MittLier.no">Mapic</a> hvis du trenger support.</div>';

        return html;

    },

    _sendEmail : function (options, done) {
        
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport(config.email.config);

        // create html
        var html = api._createEmailHTML(options.props);

        // options
        var mailOptions = {
            from: config.email.config.from,
            to: config.email.recipients, // list of receivers
            subject: config.email.subject, // Subject line
            html: html // html body
        };

        // debug
        // mailOptions.to = 'knutole@mapic.io';

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return done(error);
            done(null, mailOptions);
        });
    },


    // route: /login
    login : function (req, res, next) {

        // get info
        var email = req.body.email;
        var password = req.body.password;

        // check for user
        redis.get(email, function (err, result) {
            if (err) {
                console.log('Login err: ', err);
                return res.send({
                    access_token : null,
                    error : 'Noe feil skjedde. Vennligst prøv igjen.'
                });
            }

            // parse
            var user = safeParse(result);

            // if no user 
            if (!user) {
                return res.send({
                    access_token : null,
                    error : 'Feil kombinasjon av email og passord. Vennligst prøv igjen.'
                });
            }

            // if password matches
            if (user.password === password) {

                // create access token
                var access_token = generator.generate({
                    length: 25,
                    numbers: true,
                    uppercase : false,
                });

                // save access token
                redis.set(access_token, safeStringify({
                    email : user.email,
                    privilege : 'admin',
                    access_token : access_token
                }), function (err) {
                    res.send({
                        access_token : access_token,
                        error : null
                    });
                });


            // if wrong password
            } else {
                return res.send({
                    access_token : null,
                    error : 'Feil kombinasjon av email og passord. Vennligst prøv igjen.'
                });
            };

        });

    },


}
