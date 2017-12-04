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

        // set options
        L.setOptions(this, options);

        // create api
        app.api = new L.Api();

        // get config
        app.api.getConfig(function (err, json) {

            // parse
            var result = safeParse(json);

            /// check
            if (!result || err || result.error) return alert(app.locale.fatalError);

            // set config
            app.config = result.config;

            // google analytics
            app.ga();

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
            this._show(app.config.theme.pane || 'map');

        }.bind(this));

    },

    ga : function (event) {
        ga('create', this.options.ga, 'auto');
        ga('send', event || 'pageview');
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

        // set colors
        var theme_color = app.config.theme.color;
        console.log('theme_color', theme_color);
        this._buttons.info.div.style.backgroundColor = theme_color;
        this._buttons.map.div.style.backgroundColor = theme_color;
        this._buttons.media.div.style.backgroundColor = theme_color;

        // logo and admin link on desktop
        this._logo = L.DomUtil.get('site-logo');
        this._footer = L.DomUtil.get('site-footer');

        // only for desktop: logo/footer/admin-login
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




