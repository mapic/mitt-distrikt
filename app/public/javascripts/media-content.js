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
