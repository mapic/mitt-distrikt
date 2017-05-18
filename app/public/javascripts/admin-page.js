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
   
        // create api
        this.api = new L.Api();
   
        // google analytics
        app.ga();

        // login first
        this._initLogin();
    },

    ga : function (event) {
        ga('create', this.options.ga, 'auto');
        ga('send', event || 'pageview');
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
        var email = L.DomUtil.get('login-username').value;
        var password = L.DomUtil.get('login-password').value;

        // send to server, check if valid
        this.post('login', {
            email : email, 
            password : password
        }, function (err, response) {

            // catch errors, invalid logins
            if (err) return this._failedLogin(err);
            var res = JSON.parse(response);
            if (res.error) return this._failedLogin(res.error);
            if (!res.access_token) return this._failedLogin('Something went wrong. Please try again.')

            // login ok
            app.access_token = res.access_token;

            // This will open page if no error and existing access_token,
            // but not actually check validity of access_token.
            // This is not an issue as long as admin API endpoints check for validity.
            this._loggedIn();

        }.bind(this));
    },

    _failedLogin : function (msg) {
        // clear form
        L.DomUtil.get('login-username').value = '';
        L.DomUtil.get('login-password').value = '';

        // send analytics: todo: fix event name
        app.ga('login.failed')

        // alert
        alert(msg);
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
        this._fillMapContent();

        // media tab

    },

    _fillMapContent : function () {

        // 1. get geojson
        // 2. create table of all geojson

        app.api.getTable(function (err, json) {
            if (err) return console.error(err);
            console.log('getTable', err, json);

            this.table_entries = safeParse(json);

            if (!this.table_entries) return console.error('No table entries.');

            console.log('this.table_entries', this.table_entries);

            this._createTable();
        }.bind(this));

    },

    _createTable : function () {
        // https://www.dynatable.com/#existing-json

        var entries = this.table_entries;

        // hide #map
        L.DomUtil.get('map').style.display = 'none';

        // create table
        var html = L.DomUtil.create('div', 'table-container', this._content.map);
        var table = '<table id="notes-table">';
        table += '<thead>';
        table += '<th data-dynatable-column="address">  ' + this.locale.table.address + '</th>';
        table += '<th data-dynatable-column="text">     ' + this.locale.table.text + '</th>';
        table += '<th data-dynatable-column="tags">     ' + this.locale.table.tags + '</th>';
        table += '<th data-dynatable-column="latlng">   ' + this.locale.table.latlng + '</th>';
        table += '<th data-dynatable-column="zoom">     ' + this.locale.table.zoom + '</th>';
        table += '<th data-dynatable-column="username"> ' + this.locale.table.username + '</th>';
        table += '<th data-dynatable-column="time">     ' + this.locale.table.time + '</th>';
        table += '<th data-dynatable-column="domain">   ' + this.locale.table.domain + '</th>';
        table += '</thead>';
        table += '<tbody>';
        table += '</tbody>';
        table += '</table>';
        html.innerHTML = table;

        // format table entries 
        var table_json = this._parseTableJson(entries);

        // run dynatable
        $('#notes-table').dynatable({
          dataset: {
            records: table_json
          }
        });
    },

    _parseTableJson : function (entries) {
        // hack to make <a> fn work
        window.mapnotectx = this;

        // create table entries
        var table = [];
        _.each(entries, function (e) {
            var t = {};
            t.address = e.address || '';
            t.tags = e.tags.join(', ');
            t.text = e.text || '';
            // t.latlng = e.coordinates[0] + ', ' + e.coordinates[1];
            t.latlng = '<a href="" id="map-note-' + e.id + '" onmouseover="mapnotectx.onMapNoteMouseover(\'' + e.id + '\')">Kart</a>';
            t.zoom = parseInt(e.zoom) || '';
            t.username = e.username || '';
            t.time = new Date(e.timestamp).toDateString() || '';
            t.domain = e.portal_tag || '';
            t.image = e.image_url || '';
            table.push(t);
        }.bind(this));
        console.log('table: ', table);
        return table;
    },

    onMapNoteMouseover : function (id) {
        console.log('onMapNoteMouseover', id);

        var entry = this._getEntry(id);

        console.log('entry: ', entry);

        // create popup map with entry
        

    },

    _getEntry : function (id) {
        var entry = _.find(this.table_entries, function (t) {
            return t.id == id;
        });
        return entry;
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