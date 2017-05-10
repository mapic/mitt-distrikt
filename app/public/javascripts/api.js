L.Api = L.Class.extend({

    initialize : function () {
        console.log('L.Api connected!');
    },

    geocodeReverse : function (options, callback) {

        // create url 
        var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
        url += options.lng;
        url += '%2C'
        url += options.lat;
        url += '.json?access_token=';
        url += options.access_token || mapboxgl.accessToken;

        // get request
        this.get(url, callback);
    },

    // post a feature
    note : function (options, callback) {
        this._post('/note', options, callback);
    },

    // upload image
    upload : function (options, callback) {
        this._post('/upload', options, callback);
    },




















    get : function (url, done) {

        // create request
        var http = new XMLHttpRequest();

        // open
        http.open("GET", url, true);

        // set json header
        http.setRequestHeader('Content-type', 'application/json');

        // response
        http.onreadystatechange = function() {
            if (http.readyState == 4) {
                if (http.status == 200) {

                    // return OK 
                    done && done(null, http.responseText);
                } else {

                    // return err
                    done && done(http.status, http.responseText);
                }
            }
        };
        
        // send
        http.send();
    },

    // helper fn's
    post : function (path, options, done) {
        this._post(path, JSON.stringify(options), function (err, response) {
            done && done(err, response);
        });
    },

    _post : function (path, json, done, context, baseurl) {
        
        // create request
        var http = new XMLHttpRequest();

        // set url
        var url = this.serverUrl() + path;

        // open
        http.open("POST", url, true);

        // set json header
        http.setRequestHeader('Content-type', 'application/json');

        // response
        http.onreadystatechange = function() {
            if (http.readyState == 4) {
                if (http.status == 200) {
                    done && done(null, http.responseText); 
                } else {
                    done && done(http.status, http.responseText);
                }
            }
        };

        // add access_token to request
        // var access_token = (window.app && app.tokens) ? app.tokens.access_token : null;
        var options = _.isString(json) ? safeParse(json) : json;
        // options.access_token = options.access_token || access_token;
        var send_json = safeStringify(options);
       
        // send
        http.send(send_json);
    },

    serverUrl : function () {
        var api_version = 'v1'
        var url = 'https://mittlier.no/' + api_version; // todo: dynamic
        return url;
    },





})