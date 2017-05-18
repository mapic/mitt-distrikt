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

    // delete a feature
    deleteRecord : function (options, callback) {
        this.post('/delete', options, callback);
    },

    // post a feature
    note : function (options, callback) {
        this.post('/note', options, callback);
    },


    // upload image
    upload : function (file, callback) {
        var formData = new FormData();
        formData.append("file", file);
        var http = new XMLHttpRequest();
        var url = window.location.origin + '/v1/upload';
        http.open("POST", url);
        http.send(formData);
        http.onreadystatechange = function() {
            if (http.readyState == 4) {
                if (http.status == 200) {
                    // all good!
                    callback && callback(null, http.responseText);
                } else {
                    callback && callback(http.status, http.responseText);
                }
            }
        };
    },

    getTable : function (callback) {
        var url = window.location.origin + '/v1/table';
        url += '?access_token=' + app.access_token;

        console.log('url', url);

        this.get(url, callback);
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

    post : function (path, json, done, http_options) {
        
        // create request
        var http = new XMLHttpRequest();

        // set url
        var url = this.serverUrl() + path;

        // open
        http.open("POST", url, true);

        // set json header
        if (http_options) {
            if (http_options.content_type) {
                http.setRequestHeader('Content-type', http_options.content_type);
            }
        } else {
            http.setRequestHeader('Content-type', 'application/json');
        }

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
        var url = window.location.origin + '/' + api_version;
        return url;
    },


});