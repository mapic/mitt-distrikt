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







})