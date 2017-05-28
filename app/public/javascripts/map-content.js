
L.MapContent = L.Evented.extend({

    options : {
        flyTo : false,
    },

    initialize : function (options) {

        // set options
        L.setOptions(this, options);

        // set container
        this._container = options.container;

        // create map
        this._createMap();

        // set events
        this.listen();

        // debug
        window.debug = window.debug || {};
        window.debug.map = this._map;
    },

    listen : function () {
        this.on('reverse-lookup', this._onReverseLookup);
    },

    _createAddButton : function () {

        // create button
        this._addButton = L.DomUtil.create('div', 'add-button red-button', this._container);
        this._shadowButton = L.DomUtil.create('div', 'shadow-button white-button', this._container);
        this._shadowButton.innerHTML = 'Ok';

        // add event
        L.DomEvent.on(this._addButton, 'click', this.addNote, this);

    },

    addNote : function () {

        // 1. hide other markers
        this._hideMarkers();

        // hide (+) button
        // this._centerAddButton();

        // add position marker
        this._addPositionMarker();

    },

    _showAddButton : function () {
        if (!this._addButton) this._createAddButton();

        this._centerHelp && L.DomUtil.remove(this._centerHelp);

        // show (+) button
        L.DomUtil.removeClass(this._addButton, 'center-of-map');
        L.DomUtil.removeClass(this._shadowButton, 'color-white');
        L.DomUtil.addClass(this._shadowButton, 'white-button');
        L.DomUtil.addClass(this._addButton, 'red-button');

        // event
        L.DomEvent.off(this._shadowButton, 'click', this._openNotesCreator, this);

        // normal pitch
        var map = this._map;
        // var zoom = map.getZoom() - 2;
        map.flyTo({
            // zoom : zoom,
            pitch : 0
        });
       
    },

    _centerAddButton : function () {
        if (!this._addButton) this._createAddButton();

        this._centerHelp = L.DomUtil.create('div', 'center-help', this._container);
        this._centerHelp.innerHTML = app.locale.addNoteHelp;

        // move marker to center
        L.DomUtil.addClass(this._addButton, 'center-of-map');
        L.DomUtil.addClass(this._shadowButton, 'color-white');
        L.DomUtil.removeClass(this._shadowButton, 'white-button');
        L.DomUtil.removeClass(this._addButton, 'red-button');

        // event: cancel
        L.DomEvent.on(this._shadowButton, 'click', this._openNotesCreator, this);

        // zoom
        if (this.options.flyTo) {
            var map = this._map;
            var zoom = map.getZoom();
            if (zoom < 15) zoom += 2;
            if (zoom > 15) zoom = 15;
            map.flyTo({
                zoom : zoom,
                pitch : 60
            });
        }

    },

    _addPositionMarker : function () {
        this._centerAddButton();
    },

    _removePositionMarker : function () {
        this._showAddButton();
        this._showMarkers();
    },

    _hideMarkers : function () {
        _.each(this._layers, function (l) {
            map.setLayoutProperty(l.id, 'visibility', 'none');
        });
    },
    _showMarkers : function () {
        _.each(this._layers, function (l) {
            map.setLayoutProperty(l.id, 'visibility', 'visible');
        });
    },

    _getAddress : function () {

        // get position of marker
        var center = this._map.getCenter();

        // reverse lookup for address
        app.api.geocodeReverse({ 
            lat: center.lat, 
            lng: center.lng
        }, function(err, res) {
            if (err) console.error(err);

            var results = safeParse(res);

            var features = results ? results.features : [];
            if (!_.size(features)) console.error('no result');

            // get address
            var address = features[0] ? features[0].place_name : '';

            // fire event
            this.fire('reverse-lookup', {
                address : address,
                features : features
            });

        }.bind(this));

        // todo: fix short address

    },

    _onReverseLookup : function (options) {

        // save
        this.note.address = options.address;

        // get div
        var div = this._reverseLookupAddressDiv;
        if (!div) return console.error('div not ready');

        // set address
        div.value = this.note.address;
    },

    note : {},

    _openNotesCreator : function (center) {

        var map = this._map;

        // remove position markers
        this._removePositionMarker();

        // reverse lookup address
        this._getAddress();

        // get position of marker
        this.note.center = map.getCenter();

        // get zoom
        this.note.zoom = map.getZoom();

        // container
        this.note.container = L.DomUtil.create('div', 'write-note-container', app._container);

        // content
        var container = this._writeNoteContent = L.DomUtil.create('div', 'write-note-content', this.note.container);

        // title
        var title = L.DomUtil.create('div', 'write-note-title', container);
        title.innerHTML = app.locale.notes.noteTitle;

         // cancel button
        var cancelBtn = L.DomUtil.create('div', 'write-note-cancel-button close', container);
        L.DomEvent.on(cancelBtn, 'click', this._cancelNote, this);

        // address
        var addressContainer = L.DomUtil.create('div', 'write-note-address-container', container);
        addressContainer.innerHTML = '<i class="fa fa-map-marker big" aria-hidden="true"></i>';
        var addressInput = this._reverseLookupAddressDiv = L.DomUtil.create('input', 'write-note-address-text', addressContainer);
        addressInput.setAttribute('type', 'text');

        // photo button (only if supported)
        if (this.uploadSupported()) {

            // button
            var photoBtn = L.DomUtil.create('input', 'photo-upload-preview', container);
            photoBtn.setAttribute('id', 'file');
            photoBtn.setAttribute('type', 'file');
            photoBtn.setAttribute('name', 'file');
            photoBtn.setAttribute('accept', 'image/*');
            L.DomEvent.on(photoBtn, 'change', this._onPhotoBtnChange, this);

            // var shadowBtn = L.DomUtil.create('input', 'photo-upload-preview-shadow', container);
            var shadowImg = this.note.imageContainer = L.DomUtil.create('img', 'photo-upload-preview-shadow-img', container);

            // add to global
            this.note.uploader = photoBtn;
        }

        // text input
        var textBox1 = this.note.textboxTitle = L.DomUtil.create('input', 'write-note-text', container);
        textBox1.setAttribute('placeholder', 'Overskrift');
        textBox1.setAttribute('type', 'text');

        // text input
        var textBox = this.note.textboxText = L.DomUtil.create('input', 'write-note-text', container);
        textBox.setAttribute('placeholder', 'Skriv ditt forslag til #MittLier');
        textBox.setAttribute('type', 'text');
       
        // ok button
        var okBtn = L.DomUtil.create('div', 'write-note-ok-button', container);
        okBtn.innerHTML = app.locale.notes.send;
        L.DomEvent.on(okBtn, 'click', this._sendNote, this);

    },

    uploadSupported : function () {
        return window.File && window.FileReader && window.FormData;
    },

    _onPhotoBtnChange : function (e) {
        var file = e.target.files[0];
        if (file) {
            // only allow image uploads
            if (/^image\//i.test(file.type)) {
                this._uploadFile(file);
            } else {
                alert(app.locale.notes.invalidImage);
            }
        }
    },

    _uploadFile : function (file) {

        // mark uploading
        this._uploading = true;

        // upload
        app.api.upload(file, function (err, results) {
            if (err) {
                console.error(err);
                this._uploading = false;
                return;
            }

            // parse
            var res = safeParse(results);
            
            // notify upload successful
            this.note.image_url = res.image_url;

            // done uploading
            this._uploading = false;

            // show image
            this.note.imageContainer.style.backgroundImage = 'url(' + res.image_url + ')';

        }.bind(this));
    },

    _u : 0,

    _sendNote : function () {

        if (this.options.flyTo) {
            var map = this._map;
            map.flyTo({
                pitch : 0
            })
        }

        // wait for upload to finish
        if (this._uploading) {

            // set counter
            this._u += 1;
            console.log('Waiting for upload to finish...', this._u);

            // re-run
            return setTimeout(function () {
                this._sendNote();
            }.bind(this), 500);
        }

        // reset counter
        this._u = 0;

        // get values
        var text = this.note.textboxText.value;
        var title = this.note.textboxTitle.value;
        var center = this.note.center;
        var address = this.note.address;
        var zoom = this.note.zoom;
        var username = app.locale.notes.anon;
        var tags = ["ok", "lier"];
        var portal_tag = 'mittlier'; // todo: from config
        var image_url = this.note.image_url;

        // create geojson feature
        var feature = {
            "type": "Feature",
            "properties": {
                title : title,
                text : text,
                address : address,
                username : username,
                tags : tags,
                image_url : image_url,
                zoom : zoom,
                portal_tag : portal_tag,
                timestamp : Date.now(),
                id : Math.random().toString(36).substr(2, 6),
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    center.lng,
                    center.lat
                ]
            }
        }

        // prepare POST data
        var data = {
            feature: feature
        }

        // send note to server
        app.api.note(data, function (err, result) {
            if (err) console.error(err);
            console.log('feature result', result);

            // note sent ok
            this._onNoteSent(err);

        }.bind(this));

    },

    _onNoteSent : function (err) {

        // close note window
        L.DomUtil.remove(this.note.container);
       
        // update data
        var data_url = window.location.href + 'v1/notes';
        this._map.getSource('earthquakes').setData(data_url);

        // show markers
        this._showMarkers();

        // show add button
        this._showAddButton();

        // clear
        this.note = {};

    },

    _cancelNote : function () {
        // close note window
        L.DomUtil.remove(this.note.container);
    
        // show markers
        this._showMarkers();

        // show add button
        this._showAddButton();

        // clear
        this.note = {};
    },

    _createMap : function () {

        // get map container
        this._content = L.DomUtil.get('map');

        var mapOptions = {
            container: 'map',
            // style: 'mapbox://styles/mapbox/streets-v9',
            // style: 'mapbox://styles/mapbox/satellite-v9',
            style: 'mapbox://styles/mapbox/satellite-streets-v9',
            center: [10.234364120842656, 59.795007354532544],
            zoom : 12,
            attributionControl : false,
        };

        // if (app.isDesktop()) {
        //     mapOptions.center = [10.266840117594029, 59.785900142686074];
        //     mapOptions.bearing = -7.199999999999591;
        //     mapOptions.pitch = 60;
        //     mapOptions.zoom = 12;
        // }

        // initialize mapboxgl
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWMiLCJhIjoiY2l2MmE1ZW4wMDAwZTJvcnhtZGI4YXdlcyJ9.rD_-Ou1OdKQsHqEqL6FJLg';
        var map = this._map = new mapboxgl.Map(mapOptions);

        // map ready event
        map.on('load', this._onMapLoad.bind(this));

        // create (+) button
        this._showAddButton();
    },

    _onMapLoad : function () {
       
        // shortcut
        var map = this._map;

        // load custom marker
        map.loadImage('stylesheets/blomst-omriss.png', function (err, image) {
            if (err) console.log(err);

            // add image
            map.addImage('blomst', image);

            // set data url
            var data_url = window.location.href + 'v1/notes';

            // Add a new source from our GeoJSON data and set the
            // 'cluster' option to true. GL-JS will add the point_count property to your source data.
            map.addSource("earthquakes", {
                type: "geojson",
                // Point to GeoJSON data. 
                data: data_url, 
                // https://www.mapbox.com/mapbox-gl-js/style-spec/#sources-geojson-cluster
                cluster: true,
                clusterMaxZoom: 13, // Max zoom to cluster points on
                clusterRadius: 20 // Radius of each cluster when clustering points (defaults to 50)
            });

            // clustering
            var clustered_layer = {
                id: "clusters",
                type: "circle",
                source: "earthquakes",
                filter: ["has", "point_count"],
                paint: {
                    "circle-color": {
                        property: "point_count",
                        type: "interval",
                        stops: [
                            [0, "rgba(231, 69, 73, 0.75)"],
                            [2, "rgba(231, 69, 73, 0.75)"],
                            [5, "rgba(255, 255, 255, 0.75)"],
                        ]
                    },
                    "circle-radius": {
                        property: "point_count",
                        type: "interval",
                        stops: [
                            [0, 20],
                            [2, 30],
                            [5, 40]
                        ]
                    }
                }
            }

            // clustering numbers
            var cluster_number_layer = {
                id: "cluster-count",
                type: "symbol",
                source: "earthquakes",
                filter: ["has", "point_count"],
                layout: {
                    "text-field": "{point_count_abbreviated}",
                    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                    "text-size": 26,
                },
                paint : {
                    "text-color" : {
                        property : "point_count",
                        type : "interval",
                        stops: [
                            [0, "#FFFFFF"],
                            [2, "#FFFFFF"],
                            [5, "#e74549"],
                        ]
                    }
                }
            }

            // unclustedered points
            var notes_layer = {
                id: "notes",
                type: "symbol",
                source: "earthquakes",
                filter: ["!has", "point_count"],
                layout : {
                    "icon-image": "blomst",
                    "icon-size" : 0.25,
                },
                paint : {
                    "icon-color" : "#E74549",
                    "icon-opacity" : 1,
                    "icon-halo-blur" : 4,
                }
            }

            // add layers
            map.addLayer(clustered_layer);
            map.addLayer(cluster_number_layer);
            map.addLayer(notes_layer);

            this._layers = {
                clustered_layer : clustered_layer,
                cluster_number_layer : cluster_number_layer,
                notes_layer : notes_layer
            }

            // when map moves
            map.on('moveend', this._onMoveEnd.bind(this));

            // add popups
            this._addPopups();

            // debug
            window.map = map;

        }.bind(this));


    },

    _onMoveEnd : function () {
    },

    _addPopups : function () {

        var map = this._map;

        // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            anchor : 'bottom',
            offset : 10
        });

        // show popup fn
        var showPopup = function (e) {
            
            // stop mouse-events
            L.DomEvent.stop(e);

            // cursor
            map.getCanvas().style.cursor = 'pointer';

            // feature
            var feature = e.features[0];

            // show popup
            popup.setLngLat(feature.geometry.coordinates)
            .setHTML(this._createPopupHTML(feature.properties))
            .addTo(map);

            // add "les mer" event
            var readMore = L.DomUtil.get('note-read-more');
            L.DomEvent.on(readMore, 'click', function () {
                this._readMore(feature);
            }, this);

        }.bind(this);

        var removePopup = function (e) {
            map.getCanvas().style.cursor = '';
            popup.remove();
        };

        map.on('mouseenter', 'notes', function (e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'notes', function () {
            map.getCanvas().style.cursor = '';
        });

        // mouse: remove popup
        map.on('click', removePopup);

        // mouse: show popup (must be registered after remove popup above)
        map.on('click', 'notes', showPopup);

        // touch: show popup
        map.on('touchstart', 'notes', showPopup);

    },  

    _readMore : function (feature) {
        console.log('readMore', feature);
        
        var map = this._map;
        var note = feature.properties;

        // container
        var main_container = this._readMoreContainer = L.DomUtil.create('div', 'write-note-container', app._container);

        // content
        var container = this._writeNoteContent = L.DomUtil.create('div', 'write-note-content', main_container);

        // title
        var title = L.DomUtil.create('div', 'write-note-title capitalize', container);
        title.innerHTML = note.title;

         // cancel button
        var cancelBtn = L.DomUtil.create('div', 'write-note-cancel-button close', container);
        L.DomEvent.on(cancelBtn, 'click', this._closeReadMore, this);

        // address
        var addressContainer = L.DomUtil.create('div', 'write-note-address-container', container);
        addressContainer.innerHTML = '<i class="fa fa-map-marker big" aria-hidden="true"></i>';
        var addressInput = L.DomUtil.create('div', 'write-note-address-text-div', addressContainer);
        addressInput.innerHTML = note.address;

        // image
        var shadowImg = L.DomUtil.create('img', 'photo-upload-preview-shadow-img-div', container);
        shadowImg.style.backgroundImage = 'url(' + note.image_url + ')';
       
        // text 
        var textBox = L.DomUtil.create('div', 'write-note-text-div min-height-100', container);
        textBox.innerHTML = note.text;

        // user
        var userBox = L.DomUtil.create('div', 'write-note-user-div', container);
        userBox.innerHTML = '<i class="fa fa-user-circle" aria-hidden="true"></i>' + note.username;

        // time
        var timeBox = L.DomUtil.create('div', 'write-note-user-div', container);
        var d = new Date(note.timestamp);
        timeBox.innerHTML = '<i class="fa fa-calendar" aria-hidden="true"></i>' + d.getDate() + '.' + d.getMonth() + '.' + d.getFullYear();

        // ok button
        var okBtn = L.DomUtil.create('div', 'write-note-ok-button bottom-10', container);
        okBtn.innerHTML = app.locale.close;
        L.DomEvent.on(okBtn, 'click', this._closeReadMore, this);

    },

    _closeReadMore : function () {
        console.log('_closeReadMore');
        L.DomUtil.remove(this._readMoreContainer);
    },

    _createPopupHTML : function (p) {


        
        // get tags
        var tags = safeParse(p.tags);
        var niceTags = app.locale.notes.keywords + ': ';
        _.each(tags, function (t) {
            var v = _.upperCase(t) + ' ';
            niceTags += v 
        });

        // get name
        var name = app.locale.notes.writtenBy + ': ' + _.capitalize(p.username);

        // get image
        var image = p.image_url || false;

        console.log('P', p);

        // create html
        var html = '<div class="notes-popup">';
        
        // image
        var notesImgClass = image ? 'notes-image background-red' : 'notes-image';
        html    += '    <div class="' + notesImgClass + '">'
        if (image) {
        html    += '        <img src="' + image + '">'
        } 
        html    += '    </div>'

        // right wrapper
        html    += '    <div class="notes-right-wrapper">'

            // title
            html    += '    <div class="notes-title">'
            html    +=          p.title
            html    += '    </div>'

              
            // address
            html    += '    <div class="notes-address">';
            html    += '        <i class="fa fa-map-marker" aria-hidden="true"></i>' + p.address;
            html    += '    </div>'



            // text
            html    += '    <div class="notes-text">'
            html    +=          p.text
            html    += '    </div>'

          
           
            // // tags
            // html    += '    <div class="notes-tags">'
            // html    +=          niceTags;
            // html    += '    </div>'

            // les mer...
            html    += '    <div id="note-read-more" class="notes-read-more">'
            html    += '    Les mer...'
            html    += '    </div>'

        html    += '    </div>'
        
    
        html    += '</div>'
        return html;
    },

    resize : function () {
        this._map.resize();
    },

});
