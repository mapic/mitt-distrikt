console.log('admin-page.js');

// main app
L.Admin = L.Class.extend({

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

        // login first
        this._initLogin();
    },

    _initLogin : function () {

        // set events on login button
        var loginForm = L.DomUtil.get('login-form');
        L.DomEvent.on(loginForm, 'submit', this._logIn, this);
    },

    _logIn : function (e) {

        // security:
        // 1. lock all endpoints that actually yield sensitive information with access_token
        // 2. it doesn't matter if hackers get access to admin page, if they can't update anything.
        // 
        // todo: add endpoints for 
        //          1. get notes
        //          2. get analytics
        //          3. get media settings, etc.
        //          4. add redis on server-side to handle access_tokens
        //          5. only add users on server; simpler, safer.
        
        // stop default form action
        L.DomEvent.stop(e);

        // get values
        var username = L.DomUtil.get('login-username').value;
        var password = L.DomUtil.get('login-password').value;

        // send to server, check if valid
        this.post('login', {
            username : username, 
            password : password
        }, function (err, response) {
            if (err) return alert(err);
            var res = JSON.parse(response);
            if (res.error) return alert(res.error);
            if (!res.access_token) return alert('Something went wrong. Please try again.')
            this.access_token = res.access_token;
            this._loggedIn(); // all good, let's go! (todo: can also add single check of access_token)
        }.bind(this));
    },

    _loggedIn : function () {

        // hide login
        var loginContainer = L.DomUtil.get('login-container');
        loginContainer.style.display = 'none';

        // get browser
        this._detectDevice();

        // set locale
        this.locale = window.locale[this.options.locale || 'NO'];

        // get html
        this._initContent();

        // set events
        this._setEvents();

        // fill content
        this._fillContent();

        // set default pane
        this._show('info');

    },

    _initContent : function () {

        // get container
        this._container = L.DomUtil.get('app-container');
        this._container.style.display = 'block';
        
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

        // set logo
        if (this.isDesktop()) {
            this._logo = L.DomUtil.get('site-logo-admin');
            this._logo.style.display = 'block';
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
        this._fillInfoContent();

        // map tab

        // media tab

    },

    _fillInfoContent : function () {
        var infoContent = L.DomUtil.create('div', 'admin-info-text', this._content.info);
        var loginText = this.locale.admin.info.loginLinkText;
        var text = this.locale.admin.info.loginText;
        infoContent.innerHTML = '<a target="_blank" href="https://blog.mittlier.no/wp-admin/">' + loginText + '</a>' + ' ' + text;
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

        // show selected
        this._content[page].style.display = 'block';

        // highlight button
        this._highlightButton(page);

    },

    // highlight selected button
    _highlightButton : function (highlighted) {
        for (var btn in this._buttons) {
            L.DomUtil.removeClass(this._buttons[btn].div, 'highlighted')
        };
        L.DomUtil.addClass(this._buttons[highlighted].div, 'highlighted');
    },

    // helper fn
    getBaseUrl : function () {
        return 'https://mittlier.no/'; // todo
    },
    post : function (path, options, done) {
        this._post(path, JSON.stringify(options), function (err, response) {
            done && done(err, response);
        });
    },
    _post : function (path, json, done, context, baseurl) {
        var http = new XMLHttpRequest();
        var url = this.getBaseUrl();
        url += path;

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

        // send
        http.send(json);
    },
});