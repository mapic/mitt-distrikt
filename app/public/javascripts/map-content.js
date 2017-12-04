L.MapContent = L.Evented.extend({

    options : {
        flyTo : false,
    },

    initialize : function (options) {

        // set options
        L.setOptions(this, options);

        // get tag
        this._getTag();

        // set container
        this._container = options.container;

        // create map
        this._createMap();

        // set events
        this.listen();

        // debug
        window.debug = window.debug || {};
        window.debug.map = this._map;
        window.debug.mapContent = this;
       
    },

    _getTag : function () {

        // default
        this._tag = [app.config.default_tag];
        
        // get url
        var pathname = window.location.pathname;
        if (!_.includes(pathname, '/tag/')) return;
        
        // check for tag
        var arr = _.split(pathname, '/');
        if (_.size(arr) != 3) return;
        
        // get tag
        var tag = arr[2];
        this._tag = [tag];
    },

    listen : function () {
        this.on('reverse-lookup', this._onReverseLookup);
    },

    _createAddButton : function () {

        // create button
        this._addButton = L.DomUtil.create('div', 'add-button red-button', this._container);
        this._shadowButton = L.DomUtil.create('div', 'shadow-button white-button', this._container);
        this._shadowButton.innerHTML = app.locale.ok;

        // add event
        L.DomEvent.on(this._addButton, 'click', this.addNote, this);

    },

    addNote : function () {

        // 1. hide other markers
        this._hideMarkers();

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

        // remove popup if any
        this._popup && this._popup.remove();

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
            if (!_.size(features)) return console.error('no result');

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
        if (!div) {
            setTimeout(function () {
                var div = this._reverseLookupAddressDiv;
                if (div) div.value = this.note.address;
            }.bind(this), 1000);
        } else {

            // set address
            div.value = this.note.address;
        }
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

            // image container
            var imgContainer = L.DomUtil.create('div', 'preview-image-container', container);
            var shadowImg = this.note.imageContainer = L.DomUtil.create('img', 'photo-upload-preview-shadow-img', imgContainer);

            // add to global
            this.note.uploader = photoBtn;

            // add progress bar
            var progressBar = this.note.progressBar = L.DomUtil.create('div', 'progress-bar', container);

            // add help text
            var helpText = this.note.helpText = L.DomUtil.create('div', 'upload-help-text', container);
            helpText.innerHTML = app.locale.uploadHelpText;
        }

        // text input
        var textBox1 = this.note.textboxTitle = L.DomUtil.create('input', 'write-note-text', container);
        textBox1.setAttribute('placeholder', app.locale.title);
        textBox1.setAttribute('type', 'text');

        // text input
        var textBox = this.note.textboxText = L.DomUtil.create('input', 'write-note-text', container);
        textBox.setAttribute('placeholder', app.locale.writeYourSuggestion);
        textBox.setAttribute('type', 'text');

         // text input
        var nameBox = this.note.nameText = L.DomUtil.create('input', 'write-note-text', container);
        nameBox.setAttribute('placeholder', app.locale.yourName);
        nameBox.setAttribute('type', 'text');
       
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
        var note = this.note;
        var uploader = this._uploadFile.bind(this)
        var help = this.note.helpText;
        var rotateFn = this._rotate.bind(this);
        
        if (file) {
            
            // only allow image uploads
            if (/^image\//i.test(file.type)) {
                
                var _URL = window.URL || window.webkitURL;
                var file, img;
                img = new Image();
                img.onload = function (e) {

                    // set image
                    note.imageContainer.setAttribute('src', _URL.createObjectURL(file));

                    // rotate image
                    rotateFn(file, note.imageContainer);
                    
                    // set width
                    var w = this.width;
                    var h = this.height;
                    note.imageContainer.style.height = (h <= w) ? '100%' : 'auto';
                    note.imageContainer.style.width = (w < h) ? '100%' : 'auto';

                    // hide help text
                    help.style.zIndex = 9;

                    // start upload
                    uploader(file);

                };

                // dummy
                img.src = _URL.createObjectURL(file);

                // fit image
                L.DomUtil.addClass(note.imageContainer, 'fit-image');

            } else {
                alert(app.locale.notes.invalidImage);
            }
        }
    },

    _rotate : function (image, container) {

        // get data
        EXIF.getData(image, function () {

            // get tags
            var allMetaData = EXIF.getAllTags(this);
            if (!allMetaData) return;

            // clear
            L.DomUtil.removeClass(container, 'rotate90');
            L.DomUtil.removeClass(container, 'rotate180');
            L.DomUtil.removeClass(container, 'rotate270');

            // set
            switch(allMetaData.Orientation) {
                case 8:
                    L.DomUtil.addClass(container, 'rotate270');
                    break;
                case 3:
                    L.DomUtil.addClass(container, 'rotate180');
                    break;
                case 6:
                    L.DomUtil.addClass(container, 'rotate90');
                    break;
            }
        });
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
            
            // save image
            this.note.image = res.image;

            // done uploading
            this._uploading = false;

        }.bind(this), 

        // progress bar
        function (progress) {
            if (progress > 98) {
                this.note.progressBar.style.width = 0;
                return;
            }

            // set progress
            this.note.progressBar.style.width = progress + '%';

        }.bind(this));
    },

    _u : 0,

    _missingField : function (field) {
        field.style.border = '1px solid red';
        field.setAttribute('placeholder', app.locale.pleaseFillIn);
    },

    _sendNote : function () {

        // get values
        var text = this.note.textboxText.value;
        var title = this.note.textboxTitle.value;
        var center = this.note.center;
        var address = this.note.address;
        var zoom = this.note.zoom;
        var username = this.note.nameText.value || app.locale.notes.anon;
        var tags = this._tag;
        var portal_tag = app.config.default_tag; // todo: from config
        var image = this.note.image;

        // check values
        if (!text) return this._missingField(this.note.textboxText);
        if (!title) return this._missingField(this.note.textboxTitle);

        // wait for upload to finish
        if (this._uploading) {

            // set counter
            this._u += 1;

            // re-run
            return setTimeout(function () {
                this._sendNote();
            }.bind(this), 500);
        }

        // reset counter
        this._u = 0;

        var user_id = this._getUserId();

        // create geojson feature
        var feature = {
            "type": "Feature",
            "properties": {
                title : title,
                text : text,
                address : address,
                username : username,
                user_id : user_id,
                tags : tags,
                image : image,
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

            // parse
            this._createdFeature = safeParse(result);

            // note sent ok
            this._onNoteSent(err);

        }.bind(this));

    },

    _getUserId : function () {
        var user_id = Cookies.get('user_id');
        if (!user_id) {
            var user_id = Math.random().toString(36).substring(5);
            Cookies.set('user_id', user_id);
        }
        return user_id;
    },

    _updateData : function () {
        var data_url = window.location.origin + '/v1/notes/' + this._tag[0];
        console.log('data_url:', data_url);

        this._map.getSource('earthquakes').setData(data_url);
    },

    _onNoteSent : function (err) {

        // close note window
        L.DomUtil.remove(this.note.container);
       
        // update data
        this._updateData();

        // show markers
        this._showMarkers();

        // show add button
        this._showAddButton();

        // clear
        this.note = {};

        // show new note
        var feature = this._createdFeature.feature;
        this._showNote(feature);

    },

    _showNote : function (feature) {

        // create and open popup
        this._popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            anchor : 'bottom',
            offset : 10
        })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(this._createPopupHTML(feature.properties))
        .addTo(this._map);

        // add "les mer" event
        var readMore = L.DomUtil.get('note-read-more');
        L.DomEvent.on(readMore, 'click', function () {
            this._readMore(feature);
        }, this);
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

        this._styles = {
            satellite : 'mapbox://styles/mapic/cj3lgc596000p2sp0ma8z1km0',
            streets : 'mapbox://styles/mapbox/streets-v9',
        }

        console.log('mapbox', app.config.mapbox);

        var mapOptions = {
            container: 'map',
            // style: this._styles.satellite,
            style: this._styles.streets,
            // center: [10.24333427476904, 59.78323674962704],
            // zoom : 12,
            center: app.config.mapbox.center,
            zoom : app.config.mapbox.zoom || 10,
            pitch : app.config.mapbox.pitch || 0,
            bearing : app.config.mapbox.bearing || 0,
            attributionControl : false,
            // navigationControl : true
        };

        // initialize mapboxgl
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWMiLCJhIjoiY2ozbW53bjk5MDAwYjMzcHRiemFwNmhyaiJ9.R6p5sEuc0oSTjkcKxOSX1w';
        var map = app._map = this._map = new mapboxgl.Map(mapOptions);

        var nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-right');

        // map ready event
        map.on('load', this._onMapLoad.bind(this));

        // create (+) button
        this._showAddButton();

        // create background layer toggle control
        this._createToggleControl();

        // create tag toggle control
        this._createTagToggleControl();
    },

    _createToggleControl : function () {
        var div = L.DomUtil.create('div', 'background-toggle-control', this._container);
        div.innerHTML = '<i class="fa fa-map" aria-hidden="true"></i>';
        L.DomEvent.on(div, 'click', this._toggleBackground, this);
    },

    _createTagToggleControl : function () {
        var div = L.DomUtil.create('div', 'background-toggle-control tags-toggle', this._container);
        div.innerHTML = '<i class="fa fa-tags" aria-hidden="true"></i>';
        L.DomEvent.on(div, 'click', this._showTagList, this);

        // get tags
        app.api.getTags(function (err, tagstring) {
            console.log('err, tags', err, tagstring);
            this._tags = safeParse(tagstring);
        }.bind(this));
    },

    _showTagList : function () {

        // remove if exists
        if (this._tag_wrapper) {
            L.DomUtil.remove(this._tag_wrapper);
            delete this._tag_wrapper;
            return;
        }

        // create wrapper
        this._tag_wrapper = L.DomUtil.create('div', 'tag-list', this._container);
        
        // get tags
        var tags = this._tags;

        _.each(tags, function (t) {

            // create list item
            var t_div = L.DomUtil.create('div', 'tag-list-item', this._tag_wrapper);
            t_div.innerHTML = t;

            // add event
            L.DomEvent.on(t_div, 'click', this._onTagClick, this);

        }.bind(this));

    },

    _onTagClick : function (e) {

        // get tag
        var tag = e.target.innerHTML;

        // lowercase
        var tag = tag.toLowerCase();

        // go to tag
        window.location.href = 'https://' + app.config.domain + '/tag/' + tag;
    },

    _toggled : false,

    _toggleBackground : function () {
        var map = this._map;
        this._toggled = !this._toggled;
        if (this._toggled) {
            map.setLayoutProperty('satellite', 'visibility', 'none');
            map.setLayoutProperty('streets', 'visibility', 'visible');
        } else {
            map.setLayoutProperty('satellite', 'visibility', 'visible');
            map.setLayoutProperty('streets', 'visibility', 'none');
        }
    },

    _onMapLoad : function () {
       
        // shortcut
        var map = this._map;

        // streets raster tiles
        // map.addSource('mapbox-tiles', {
        //     "type": "raster",
        //     "tiles": ['https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwaWMiLCJhIjoiY2l2MmE1ZW4wMDAwZTJvcnhtZGI4YXdlcyJ9.rD_-Ou1OdKQsHqEqL6FJLg'],
        //     "tileSize": 256
        // });
        console.log('config', app.config);

        console.log('app.config.mapbox.streets.tiles', app.config.mapbox.streets.tiles);
       
        // streets raster tiles
        map.addSource('streets-source', {
            "type" : app.config.mapbox.streets.type,
            "tiles" : [app.config.mapbox.streets.tiles],
            "tileSize" : 256
        });
        map.addLayer({
            "id": "streets",
            "type": app.config.mapbox.streets.type,
            "source": "streets-source",
            "minzoom": 0,
            "maxzoom": 22,
            "source-layer" : "background"
        });
        
        // hide by default
        map.setLayoutProperty('streets', 'visibility', 'none');

        // satellite raster tiles
        map.addSource('satellite-source', {
            "type": app.config.mapbox.satellite.type,
            "tiles": [app.config.mapbox.satellite.tiles],
            "tileSize": 256
        });
        map.addLayer({
            "id": "satellite",
            "type": app.config.mapbox.satellite.type,
            "source": "satellite-source",
            "minzoom": 0,
            "maxzoom": 22
        });

        // move order
        map.moveLayer('satellite', 'background');

        // load custom marker
        map.loadImage(window.location.origin + '/stylesheets/blomst-omriss.png', function (err, image) {
            if (err) console.log(err);

            // add image
            map.addImage('blomst', image);

            // load second image
            // map.loadImage(window.location.origin + '/stylesheets/blomst-yellow.png', function (err, image2) {
            map.loadImage(window.location.origin + '/stylesheets/blomst-omriss.png', function (err, image2) {

                // add image
                map.addImage('blomst2', image2);

                // set data url
                var data_url = window.location.origin + '/v1/notes/' + this._tag[0];

                map.addSource("earthquakes", {
                    type: "geojson",
                    data: data_url, 
                });

                // get user id
                var user_id = this._getUserId();

                // all points except own
                var notes_layer = {
                    id: "notes",
                    type: "symbol",
                    source: "earthquakes",
                    filter: ["!=", "user_id", user_id],
                    layout : {
                        "icon-image": "blomst",
                        "icon-size" : 0.4,
                        "icon-allow-overlap" : true
                    }
                }

                // add layers
                map.addLayer(notes_layer);

                 // own points
                var own_notes_layer = {
                    id: "own-notes",
                    type: "symbol",
                    source: "earthquakes",
                    filter: ["==", "user_id", user_id],
                    layout : {
                        "icon-image": "blomst2",
                        "icon-size" : 0.4,
                        "icon-allow-overlap" : true
                    }
                }

                // add layers
                map.addLayer(own_notes_layer);

                this._layers = {
                    notes_layer : notes_layer
                }

                // when map moves
                map.on('moveend', this._onMoveEnd.bind(this));

                // add popups
                this._addPopups();

                // debug
                window.map = map;

                // check link redirect
                this._checkLinkRedirect();

            }.bind(this));

        }.bind(this));

        // add geojson buildings
        map.addLayer({
            'id': 'room-extrusion',
            'type': 'fill-extrusion',
            'source': {
                // Geojson Data source used in vector tiles, documented at
                // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
                'type': 'geojson',
                // 'data': 'https://gist.githubusercontent.com/anonymous/d5679f90d76a185d2aeed04c10d5890b/raw/96aad4c02d5d9aa6c5f592ce245bca52c5159b9a/map.geojson'
                'data': app.config.mapbox.buildings.geojson
            },
            'paint': {
                // See the Mapbox Style Spec for details on property functions
                // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
                'fill-extrusion-color': {
                    // Get the fill-extrusion-color from the source 'color' property.
                    'property': 'color',
                    'type': 'identity'
                },
                // 'fill-extrusion-color': '#6eba42',
                'fill-extrusion-height': {
                    // Get fill-extrusion-height from the source 'height' property.
                    'property': 'height',
                    'type': 'identity'
                },
                // 'fill-extrusion-base': {
                //     // Get fill-extrusion-base from the source 'base_height' property.
                //     'property': 'base_height',
                //     'type': 'identity'
                // },
                // Make extrusions slightly opaque for see through indoor walls.
                'fill-extrusion-opacity': 0.5
            }
        });



    },

    _checkLinkRedirect : function (feature) {

        // get url link
        var link = window.location.pathname;
        
        // return if no link
        if (!_.includes(link, '/direct/')) return;
        
        // need to wait for map ready
        setTimeout(function () {

            // get link id
            var link_id = link.split('/direct/').reverse()[0];
            this._link_id = link_id;

            // get feature
            var map = this._map;
            var features = map.queryRenderedFeatures({ layers: ['notes', 'own-notes'] });
            var link_note = _.find(features, function (f) {
                return f.properties.id == link_id;
            });

            // show and center
            this._showNote(link_note);
            map.flyTo({center: link_note.geometry.coordinates});
        
        }.bind(this), 500);
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

        var fly = function (e) {

            // stop mouse-events
            L.DomEvent.stop(e);

            // get feature id
            var f_id = this._createdFeature ? this._createdFeature.feature.properties.id : false;
           
            // feature
            var feature = f_id ? _.find(e.features, function (f) { return f.properties.id == f_id }) : e.features[0];

            // fly
            map.flyTo({center: feature.geometry.coordinates});

        };

        // show popup fn
        var showPopup = function (e) {

            // stop mouse-events
            L.DomEvent.stop(e);

            // cursor
            map.getCanvas().style.cursor = 'pointer';

            // get feature id
            var f_id = this._createdFeature ? this._createdFeature.feature.properties.id : false;
            
            // find feature
            var feature = _.find(e.features, function (f) { return f.properties.id == f_id });
            if (!feature) {
                if (this._createdFeature) {
                    feature = this._createdFeature.feature;
                } else {
                    feature = e.features[0];
                }
            }
           
            // this._showNote(feature);
            // show popup
            var geometry = feature.geometry || feature._geometry;
            popup.setLngLat(geometry.coordinates)
            .setHTML(this._createPopupHTML(feature.properties))
            .addTo(map);

            // add "les mer" event
            var readMore = L.DomUtil.get('note-read-more');
            L.DomEvent.on(readMore, 'click', function () {
                this._readMore(feature);
            }, this);

            // var f_id = feature.properties.f_id;
            // var img = L.DomUtil.get('image-' + f_id);
            // if (img) {
            //     var rotateClass = 'rotate' + feature.properties.image.rotate;
            //     L.DomUtil.addClass(shadowImg, rotateClass);
            // }

            // save
            this._popup = popup;

            // clear
            this._createdFeature = null;

        }.bind(this);

        // save
        this._popup = this._popup || popup;

        // cursors
        map.on('mouseenter', 'notes', function (e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'notes', function () {
            map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'own-notes', function (e) {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'own-notes', function () {
            map.getCanvas().style.cursor = '';
        });

        // mouse: remove popup
        map.on('click', this._removePopup.bind(this));

        // mouse: show popup (must be registered _after_ remove popup above)
        map.on('click', 'notes', showPopup);
        map.on('click', 'own-notes', showPopup);

        map.on('mouseup', 'notes', fly);
        map.on('mouseup', 'own-notes', fly);

        // touch: show popup
        map.on('touchstart', 'notes', showPopup);
        map.on('touchstart', 'own-notes', showPopup);

    },  

    _removePopup : function () {
        this._map.getCanvas().style.cursor = '';
        this._popup.remove();
    },

    _readMore : function (feature) {
        
        var map = this._map;
        var note = feature.properties;
        var image = safeParse(note.image);
        var image_url = image ? image.original : '';

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
        var imgContainer = L.DomUtil.create('div', 'preview-image-container read-more', container);
        if (image && image.original) {

            // image container
            var shadowImg = L.DomUtil.create('img', 'photo-upload-preview-shadow-img-div fit-image', imgContainer);
            shadowImg.setAttribute('src', image_url);

            // set width
            var w = image.width;
            var h = image.height;
            shadowImg.style.height = (h <= w) ? '100%' : 'auto';
            shadowImg.style.width = (w < h) ? '100%' : 'auto';

            var rotateClass = 'rotate' + image.rotate;
            L.DomUtil.addClass(shadowImg, rotateClass);

        } else {
            L.DomUtil.addClass(imgContainer, 'empty-preview');
        }

        // user
        var userBox = L.DomUtil.create('div', 'write-note-user-div', container);
        userBox.innerHTML = '<i class="fa fa-user-circle" aria-hidden="true"></i>' + note.username;

        // time
        var timeBox = L.DomUtil.create('div', 'write-note-user-div', container);
        var d = new Date(note.timestamp);
        timeBox.innerHTML = '<i class="fa fa-calendar" aria-hidden="true"></i>' + d.getDate() + '.' + d.getMonth() + '.' + d.getFullYear();
 
        // text 
        var textBox = L.DomUtil.create('div', 'write-note-text-div min-height-100', container);
        textBox.innerHTML = note.text;

        // like button
        var like_container = L.DomUtil.create('div', 'like-container', container);
        var likeBtn  = '<div class="fb-like" ';
        likeBtn     += 'data-href="';
        likeBtn     += window.location.origin + '/v1/direct/' + note.id;
        likeBtn     += '" data-layout="standard" data-width="300px" data-action="like" data-share="true" data-size="large" data-show-faces="true"></div>'
        like_container.innerHTML = likeBtn;
        FB.XFBML.parse(like_container);

        // close button
        var okBtn = L.DomUtil.create('div', 'write-note-ok-button bottom-10', container);
        okBtn.innerHTML = app.locale.close;
        L.DomEvent.on(okBtn, 'click', this._closeReadMore, this);

        // check if own note
        var user_id = this._getUserId();
        if (note.user_id == user_id) {

            // create edit button
            var editBtn = L.DomUtil.create('div', 'edit-own-note-btn', container);
            editBtn.innerHTML = app.locale.deleteNote;

            // event
            L.DomEvent.on(editBtn, 'click', function () {
                this._undoOwnNote(note.id);
            }.bind(this), this);
        }

    },

    _undoOwnNote : function (id) {

        // confirm delete
        var ok = confirm(app.locale.confirmDelete);
        if (ok) {

            // undo record
            app.api.undoRecord({id : id}, function (err, results) {
                if (err) return alert(err);

                // update data
                this._updateData();

                // clean up screen
                this._closeReadMore();
                this._removePopup();

            }.bind(this));
        };
    },

    _closeReadMore : function () {
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

        // parse
        var p_image = safeParse(p.image);

        // get name
        var name = app.locale.notes.writtenBy + ': ' + _.capitalize(p.username);

        // get image
        var image = (p_image && p_image.original) ? p_image.original : false;

        // create html
        var html = '<div class="notes-popup">';
        
        // image
        var rotateClass = 'rotate';
        rotateClass += p_image.rotate || 0;
        var notesImgClass = image ? 'notes-image background-none ' + rotateClass : 'notes-image';
        html    += '    <div class="' + notesImgClass + '">'
        if (image) {
        
        html    += '        <img id="image-' + p.id + '" src="' + image + '">'
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
           
            // les mer...
            html    += '    <div id="note-read-more" class="notes-read-more">'
            // html    += '    Les mer...'
            html    += app.locale.readMore;
            html    += '    </div>'

        html    += '    </div>'
    
        html    += '</div>'
        return html;
    },

    resize : function () {
        this._map.resize();
    },

});
