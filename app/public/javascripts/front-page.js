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

        L.setOptions(this, options);

        // get html
        this._getContent();

        // set events
        this._setEvents();

        // fill content
        this._fillContent();

        // set default pane
        this._show('info');
    },

    _getContent : function () {
        
        // get content
        this._content.info = L.DomUtil.get('content-info');
        this._content.map = L.DomUtil.get('content-kart');
        this._content.media = L.DomUtil.get('content-media');

        // get buttons
        this._buttons.info.div  = L.DomUtil.get('button-info');
        this._buttons.map.div  = L.DomUtil.get('button-kart');
        this._buttons.media.div = L.DomUtil.get('button-media');
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
    _showInfo : function () { this._show('info');},
    _showMap : function () { this._show('map');},
    _showMedia : function () { this._show('media');},
    _show : function (page) {

        // hide all
        if (page != 'info') this._content.info.style.display = 'none';
        if (page != 'map') this._content.map.style.display = 'none';
        if (page != 'media') this._content.media.style.display = 'none';

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
        var blogSource = 'https://blog.meon.io';

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
    },

    _initContent : function () {

        this._content = L.DomUtil.get('map');

        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwaWMiLCJhIjoiY2l2MmE1ZW4wMDAwZTJvcnhtZGI4YXdlcyJ9.rD_-Ou1OdKQsHqEqL6FJLg';
        this._map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9'
        });
    },

    resize : function () {
        this._map.resize();
    },

});

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

        // init feed
        this._feed = new Instafeed({
            get: 'tagged',
            tagName: 'firestartah',
            accessToken: '21416541.ba4c844.8efa3e551006456fb59330eadb7f2c41',
            target : 'instagram-content',
            resolution: 'standard_resolution',
            links: false,
            template : template
        });
        // access token: https://github.com/stevenschobert/instafeed.js/issues/408#issuecomment-297696860
        
        // start feed
        this._feed.run();
    },

    _instagramTemplate : function () {
        // template for instagram feed
        // see http://instafeedjs.com/#templating
        var html =  '<div class="i-wrapper">';
        html +=         '<div class="i-image">'
        html +=             '<img src="{{image}}" />';
        html +=         '</div>';
        html +=         '<div class="i-caption">'
        html +=             '{{caption}}';
        html +=         '</div>';
        html +=     '</div>';
        return html;
    },


});
