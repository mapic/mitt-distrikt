
L.MapContent = L.Evented.extend({
    initialize : function (options) {

        // set options
        L.setOptions(this, options);

        // set container
        this._container = options.container;

        // init content
        this._initContent();

        // set events
        this.listen();

        // debug
        window.debug = window.debug || {};
        window.debug.map = this._map;
    },

    listen : function () {
        this.on('reverse-lookup', this._onReverseLookup);
    },

    _initContent : function () {

        // get map container
        this._content = L.DomUtil.get('map');

        // initialize mapboxgl
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWMiLCJhIjoiY2l2MmE1ZW4wMDAwZTJvcnhtZGI4YXdlcyJ9.rD_-Ou1OdKQsHqEqL6FJLg';
        var map = this._map = new mapboxgl.Map({
            container: 'map',
            // style: 'mapbox://styles/mapbox/streets-v9',
            // style: 'mapbox://styles/mapbox/satellite-v9',
            style: 'mapbox://styles/mapbox/satellite-streets-v9',
            center: [10.234364120842656, 59.795007354532544],
            zoom : 12,
            attributionControl : false,
        });

        // map ready event
        map.on('load', this._onMapLoad.bind(this));

        // create (+) button
        this._showAddButton();
    },

    _createAddButton : function () {

        // create button
        this._addButton = L.DomUtil.create('div', 'add-button', this._container);
        this._shadowButton = L.DomUtil.create('div', 'shadow-button', this._container);

        // add event
        L.DomEvent.on(this._addButton, 'click', this.addNote, this);

    },

    addNote : function () {

        // 1. hide other markers
        this._hideMarkers();

        // hide (+) button
        this._hideAddButton();

        // add position marker
        this._addPositionMarker();

    },

    _showAddButton : function () {
        if (!this._addButton) this._createAddButton();

        // show (+) button
        L.DomUtil.removeClass(this._addButton, 'display-none');
        L.DomUtil.removeClass(this._shadowButton, 'display-none');
    },
    _hideAddButton : function () {
        if (!this._addButton) this._createAddButton();
        
        // hide (+) button
        L.DomUtil.addClass(this._addButton, 'display-none');
        L.DomUtil.addClass(this._shadowButton, 'display-none');
    },

    _addPositionMarker : function () {
        
        // add marker in middle of screen
        this.note.geoMarker = L.DomUtil.create('div', 'geo-marker', this._container);

        // add text box
        this.note.geoMarkerText = L.DomUtil.create('div', 'geo-marker-text', this.note.geoMarker);
        this.note.geoMarkerText.innerHTML = app.locale.notes.geoMarkerText;

        // add "accept geo" button
        this.note.acceptPositionButton = L.DomUtil.create('div', 'accept-geo-button', this._container);
        this.note.acceptPositionButton.innerHTML = app.locale.notes.acceptPositionButton;
        L.DomEvent.on(this.note.acceptPositionButton, 'click', this._openNotesCreator, this);

    },

    _removePositionMarker : function () {
        L.DomUtil.remove(this.note.geoMarker);
        L.DomUtil.remove(this.note.geoMarkerText);
        L.DomUtil.remove(this.note.acceptPositionButton);
        L.DomEvent.off(this.note.acceptPositionButton, 'click', this._openNotesCreator, this);
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
            console.log('results:', results);

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

    },

    _onReverseLookup : function (options) {

        // save
        this.note.address = options.address;

        // get div
        var div = this._reverseLookupAddressDiv;
        if (!div) return console.error('div not ready');

        // set address
        div.innerHTML = this.note.address;
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

        // content:
        // - reverse lookup address
        // - title
        // - explanation/description
        // - text-box
        // - button for taking/uploading photo
        // - OK-button (post!)

        // title
        var title = L.DomUtil.create('div', 'write-note-title', container);
        title.innerHTML = app.locale.notes.noteTitle;

        // address
        var address = this._reverseLookupAddressDiv = L.DomUtil.create('div', 'write-note-address', container);

        // description
        var explanation = L.DomUtil.create('div', 'write-note-explanation', container);
        explanation.innerHTML = app.locale.notes.explanation;

        // image container
        if (this.uploadSupported()) this.note.imageContainer = L.DomUtil.create('div', 'write-note-image-container', container);

        // text input
        var textBox = this.note.textbox = L.DomUtil.create('textarea', 'write-note-textarea', container);
        textBox.setAttribute('placeholder', 'Skriv ditt forslag til #MittLier');

        // photo button (only if supported)
        if (this.uploadSupported()) {

            // button
            var photoBtn = L.DomUtil.create('input', 'write-note-photo-button', container);
            photoBtn.setAttribute('id', 'file');
            photoBtn.setAttribute('type', 'file');
            photoBtn.setAttribute('name', 'file');
            photoBtn.setAttribute('accept', 'image/*');
            L.DomEvent.on(photoBtn, 'change', this._onPhotoBtnChange, this);

            // add to global
            this.note.uploader = photoBtn;

            // label
            var label = L.DomUtil.create('label', '', container);
            label.setAttribute('for', 'file');
            label.innerHTML = app.locale.notes.addPhoto;
        }

        // ok button
        var okBtn = L.DomUtil.create('div', 'write-note-ok-button', container);
        okBtn.innerHTML = app.locale.notes.send;
        L.DomEvent.on(okBtn, 'click', this._sendNote, this);

        // cancel button
        var cancelBtn = L.DomUtil.create('div', 'write-note-ok-button', container);
        cancelBtn.innerHTML = app.locale.notes.cancel;
        L.DomEvent.on(cancelBtn, 'click', this._cancelNote, this);

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

            // todo: show image?
            console.log('upload done:', res);
            this.note.imageContainer.innerHTML = '<img src="' + res.image_url + '" class="note-image-container">';

        }.bind(this));
    },

    _u : 0,

    _sendNote : function () {

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
        var text = this.note.textbox.value;
        var center = this.note.center;
        var address = this.note.address;
        var zoom = this.note.zoom;
        var username = 'anonymous';
        var tags = ["ok", "lier"];
        var portal_tag = 'mittlier'; // todo: from config
        var image_url = this.note.image_url;

        // create geojson feature
        var feature = {
            "type": "Feature",
            "properties": {
                text : text,
                address : address,
                username : username,
                tags : tags,
                image_url : image_url,
                zoom : zoom,
                portal_tag : portal_tag,
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

    },

    _cancelNote : function () {
        // close note window
        L.DomUtil.remove(this.note.container);
    
        // show markers
        this._showMarkers();

        // show add button
        this._showAddButton();
    },

    _onMapLoad : function () {
       
        // shortcut
        var map = this._map;

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
                        [0, "#51bbd6"],
                        [2, "rgba(252, 193, 73, 0.75)"],
                        [5, "rgba(137, 174, 77, 0.75)"],
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
                "text-color" : "#ffffff"

            }
        }

        // unclustedered points
        var notes_layer = {
            id: "notes",
            type: "circle",
            source: "earthquakes",
            filter: ["!has", "point_count"],
            paint: {
                "circle-color": "rgba(156, 214, 229, 0.75)",
                "circle-radius": 10,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
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

    },

    _onMoveEnd : function () {
    },

    _addPopups : function () {

        var map = this._map;

        // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            anchor : 'bottom',
            offset : 10
        });

        // show popup
        map.on('mouseenter', 'notes', function(e) {
            
            // cursor
            map.getCanvas().style.cursor = 'pointer';

            // feature
            var feature = e.features[0];

            // show popup
            popup.setLngLat(feature.geometry.coordinates)
            .setHTML(this._createPopupHTML(feature.properties))
            .addTo(map);

        }.bind(this));

        // hide popup
        map.on('mouseleave', 'notes', function() {
            map.getCanvas().style.cursor = '';
            popup.remove();
        }.bind(this));

    },  

    _createPopupHTML : function (p) {
        
        console.log('create Popup', p);

        // parse tags
        var tags = safeParse(p.tags);
        var niceTags = tags ? tags.join(', ') : '';

        // get image
        var image = p.image_url || false;

        // create html
        var html = '<div class="notes-popup">';
        html    += '    <div class="notes-text">'
        html    +=          p.text
        html    += '    </div>'
        html    += '    <div class="notes-tags">'
        html    +=          niceTags;
        html    += '    </div>'
        html    += '    <div class="notes-users">'
        html    +=          p.username;
        html    += '    </div>'
        if (image) {
        html    += '    <div class="notes-image">'
        html    += '        <img src="' + image + '">'
        html    += '    </div>'
        }
        html    += '</div>'
        return html;
    },

    resize : function () {
        this._map.resize();
    },

});
