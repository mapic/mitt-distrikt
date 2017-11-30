
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
        var blogSource = 'https://' + app.config.wordpress_domain;
        
        // create iframe
        this._container.innerHTML = '<iframe id="info-iframe" src="' + blogSource + '"></iframe>'
    },
}); 

