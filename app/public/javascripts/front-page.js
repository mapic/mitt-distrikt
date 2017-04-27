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

    _fillContent : function () {

        this.info = new L.Info({
            container : this._content.info
        });
        this.map = new L.MapContent({
            container : this._content.map
        });
        this.media = new L.Media({
            container : this._content.media
        });

    },


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

        console.log('_show', page);
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
        L.setOptions(this, options);

        this._container = options.container;

        this._initContent();

    },

    _initContent : function () {
        var blogSource = 'https://blog.meon.io';
        this._container.innerHTML = '<iframe id="info-iframe" src="' + blogSource + '"></iframe>'
    },
}); 

L.MapContent = L.Class.extend({
    initialize : function (options) {
        L.setOptions(this, options);

        this._container = options.container;

        this._initContent();
    },

    _initContent : function () {


    },


});

L.Media = L.Class.extend({
    initialize : function (options) {
        L.setOptions(this, options);

        this._initContent();

    },

     _initContent : function () {

        this._content = L.DomUtil.create('instagram-content');
        this._content.id = 'instagram-content';

        var feed = new Instafeed({
            get: 'tagged',
            tagName: 'awesome',
            accessToken: '21416541.3d76c98.9887274b4bc649dfa096fd6d45172647',
            target : 'instagram-content'
        });
        feed.run();
    },


});
