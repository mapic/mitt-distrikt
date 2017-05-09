console.log('front-page.js')

// main app
L.App = L.Class.extend({

    _buttons : {
        info : {},
        map : {},
        media : {}
    },

    _content : {},

    initialize : function (options) {

        // shortcut
        window.app = this;

        L.setOptions(this, options);

        // get browser
        this._detectDevice();

        // set locale
        this.locale = window.locale[options.locale || 'NO'];

        // get html
        this._initContent();

        // set events
        this._setEvents();

        // fill content
        this._fillContent();

        // set default pane
        this._show('map');
    },

    _initContent : function () {

        // get container
        this._container = L.DomUtil.get('app-container');
        
        // get content
        this._content.info = L.DomUtil.get('content-info');
        this._content.map = L.DomUtil.get('content-kart');
        this._content.media = L.DomUtil.get('content-media');

        // get buttons
        this._buttons.info.div  = L.DomUtil.get('button-info');
        this._buttons.map.div  = L.DomUtil.get('button-kart');
        this._buttons.media.div = L.DomUtil.get('button-media');

        // set button text
        this._buttons.info.div.innerHTML = this.locale.buttons.info;
        this._buttons.map.div.innerHTML = this.locale.buttons.map;
        this._buttons.media.div.innerHTML = this.locale.buttons.media;

        // logo and admin link on desktop
        this._logo = L.DomUtil.get('site-logo');
        this._footer = L.DomUtil.get('site-footer');

        if (this.isDesktop()) {

            // set logo
            this._logo.style.display = 'block';
            
            // set footer
            this._footer.style.display = 'block';
            var link = '<a href="/admin" target="_blank">' + this.locale.footer.login + '</a>';
            var text = this.locale.footer.text + link;
            this._footer.innerHTML = text;
        }

    },

    _setEvents : function () {

        // create hammer elements
        var hammerOptions = {};
        this._buttons.info.event = new Hammer(this._buttons.info.div, hammerOptions);
        this._buttons.map.event = new Hammer(this._buttons.map.div, hammerOptions);
        this._buttons.media.event = new Hammer(this._buttons.media.div, hammerOptions);
        
        // set events
        this._buttons.info.event.on('tap', this._showInfo.bind(this));
        this._buttons.map.event.on('tap', this._showMap.bind(this));
        this._buttons.media.event.on('tap', this._showMedia.bind(this));
    },

    _detectDevice : function  () {
        // see https://hgoebl.github.io/mobile-detect.js/doc/MobileDetect.html
        this._md = new MobileDetect(window.navigator.userAgent);
    },

    isJustMobile : function () {
        return this._md.mobile() && !this._md.tablet();
    },

    isMobile : function () {
        return this._md.mobile();
    },

    isTablet : function () {
        return this._md.tablet();
    },

    isDesktop : function () {
        var isDesktop = !this._md.tablet() && !this._md.mobile();
        return isDesktop;
    },

    // create tab content
    _fillContent : function () {

        // info tab
        this.info = new L.Info({
            container : this._content.info
        });

        // map tab
        this.map = new L.MapContent({
            container : this._content.map
        });

        // media tab
        this.media = new L.Media({
            container : this._content.media
        });
    },

    // helper fn to show/hide the three tabs
    _showInfo  : function () { this._show('info');},
    _showMap   : function () { this._show('map');},
    _showMedia : function () { this._show('media');},
    _show : function (page) {

        // hide all
        if (page != 'info') this._content.info.style.display = 'none';
        if (page != 'map') this._content.map.style.display = 'none';
        if (page != 'media') this._content.media.style.display = 'none';

        // show/hide footer (should only show on info)
        this._footer.style.display = (page == 'info') ? 'block' : 'none';

        // show selected
        this._content[page].style.display = 'block';

        // highlight button
        this._highlightButton(page);

        // fix resize problem
        if (page == 'map') {
            this.map.resize();
        }
    },

    // highlight selected button
    _highlightButton : function (highlighted) {
        for (var btn in this._buttons) {
            L.DomUtil.removeClass(this._buttons[btn].div, 'highlighted')
        };
        L.DomUtil.addClass(this._buttons[highlighted].div, 'highlighted');
    },
});


L.Info = L.Class.extend({
    initialize : function (options) {

        // set options
        L.setOptions(this, options);

        // set container
        this._container = options.container;

        // init content
        this._initContent();
    },

    _initContent : function () {

        // get blog url for iframe
        var blogSource = 'https://blog.mittlier.no';

        // create iframe
        this._container.innerHTML = '<iframe id="info-iframe" src="' + blogSource + '"></iframe>'
    },
}); 



L.MapContent = L.Class.extend({
    initialize : function (options) {

        // set options
        L.setOptions(this, options);

        // set container
        this._container = options.container;

        // init content
        this._initContent();

        // debug
        window.debug = window.debug || {};
        window.debug.map = this._map;
    },

    _initContent : function () {

        // get map container
        this._content = L.DomUtil.get('map');

        // initialize mapboxgl
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWMiLCJhIjoiY2l2MmE1ZW4wMDAwZTJvcnhtZGI4YXdlcyJ9.rD_-Ou1OdKQsHqEqL6FJLg';
        var map = this._map = new mapboxgl.Map({
            container: 'map',
            // style: 'mapbox://styles/mapbox/streets-v9',
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [10.234364120842656, 59.795007354532544],
            zoom : 12,
            attributionControl : false,
        });

        // map ready event
        map.on('load', this._onMapLoad.bind(this));

        // create (+) button
        this._createAddButton();
    },

    _createAddButton : function () {

        var addBtn = L.DomUtil.create('div', 'add-button', this._container);
        var shadowBtn = L.DomUtil.create('div', 'shadow-button', this._container);

        L.DomEvent.on(addBtn, 'click', this._openNoteCreator, this);

    },

    _openNoteCreator : function () {
        console.log('_openNoteCreator');
    },

    _onMapLoad : function () {
       
        // shortcut
        var map = this._map;
       
        // set data url
        var data_url = 'https://gist.githubusercontent.com/anonymous/edb86febf4f61176be3a695a999edcd6/raw/fad8092ded78fc5305f81b46afc474461f5d22e8/map.geojson';
       
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
        var clustering = {
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
                        [2, "#f1f075"],
                        [5, "#f28cb1"],
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
        var clustering_numbers = {
            id: "cluster-count",
            type: "symbol",
            source: "earthquakes",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 26
            }
        }

        // unclustedered points
        var unclustedered_layer = {
            id: "notes",
            type: "circle",
            source: "earthquakes",
            filter: ["!has", "point_count"],
            paint: {
                "circle-color": "#11b4da",
                "circle-radius": 10,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
            }
        }

        // add layers
        map.addLayer(clustering);
        map.addLayer(clustering_numbers);
        map.addLayer(unclustedered_layer);

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

            // get feature anchor
            // popup.options.anchor = this._getFeatureAnchor(feature);
            // popup._update();

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

    _getFeatureAnchor : function (f) {

        // figure out which marker is furthest north/east etc and set popup anchor accordingly

        console.log('_getFeaturePosition');

        // get all features
        var features = _.uniqBy(map.queryRenderedFeatures({ layers: ['notes'] }), function (feat) {
            return feat.properties.id;
        });

        console.log('features', features);

        console.log('f:', f);

        return 'bottom-left';

    },

    _createPopupHTML : function (p) {
        
        // parse tags
        var tags = safeParse(p.tags);
        var niceTags = tags ? tags.join(', ') : '';

        // create html
        var html = '<div class="notes-popup">';
        html    += '    <div class="notes-text">'
        html    +=          p.text
        html    += '    </div>'
        html    += '    <div class="notes-tags">'
        html    +=          niceTags;
        html    += '    </div>'
        html    += '    <div class="notes-users">'
        html    +=          p.user
        html    += '    </div>'
        html    += '</div>'
        return html;
    },

    resize : function () {
        this._map.resize();
    },

});

// shortcut
var cl = console.log
var safeParse = function (s) {
    try {
        var o = JSON.parse(s);
        return o;
    } catch (e) {
        return false;
    }
}


L.Media = L.Class.extend({
    initialize : function (options) {
        
        // set options
        L.setOptions(this, options);

        // set container
        this._container = options.container;

        // init contetn
        this._initContent();
    },

     _initContent : function () {

        // create div
        this._content = L.DomUtil.create('div', 'instagram-content', this._container);
        this._content.id = 'instagram-content';

        // get instagram template
        var template = this._instagramTemplate();

        // low res on small mobiles
        var resolution = app.isJustMobile() ? 'low_resolution' : 'standard_resolution';

        // init feed
        this._feed = new Instafeed({
            get: 'tagged',
            tagName: 'lier',
            // access token, see: https://github.com/stevenschobert/instafeed.js/issues/408#issuecomment-297696860
            accessToken: '21416541.ba4c844.8efa3e551006456fb59330eadb7f2c41',
            target : 'instagram-content',
            resolution: resolution,
            template : template,
            links: false,
        });
        
        // start feed
        this._feed.run();
    },

    _instagramTemplate : function () {
        // template for instagram feed
        // see http://instafeedjs.com/#templating
        // https://gist.github.com/knutole/9673b07ef26f038a5d7ea0e38e0311c6
        var html =  '<div class="i-wrapper">';
        html +=         '<div class="i-avatar">'
        html +=             '<div class="i-avatar-img">';
        html +=                 '<img src="{{model.user.profile_picture}}" />';
        html +=             '</div>';
        html +=             '<div class="i-user">'
        html +=                 '{{model.user.full_name}}';
        html +=             '</div>';
        html +=         '</div>';
        html +=         '<div class="i-image">'
        html +=             '<img src="{{image}}" />';
        html +=         '</div>';
        html +=         '<div class="i-caption">'
        html +=             '{{caption}}';
        html +=         '</div>';
        html +=         '<div class="i-likes">'
        html +=             '<i class="fa fa-heart float-left" aria-hidden="true"></i>';
        html +=             '<div class="i-likes-count">{{likes}}</div>';
        html +=         '</div>';
        html +=     '</div>';
        return html;
    },


});
