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

        // get feed from server
        app.api.getSocialMediaFeedAdmin(function (err, json) {

            var result = this._safeParse(json);

            var sorted = _.sortBy(result.posts, function (rp) {
                return parseInt(rp.created_time);
            });

            var reversed = sorted.reverse();

            _.each(reversed, function (p) {

                // create DOM
                if (!p.filtered) this._createPost(p);

            }.bind(this));

        }.bind(this));

    },


    _formatDate : function (timestamp) {
        var date = new Date(timestamp * 1000);
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    },

    _createPost : function (post) {

        var wrapper = L.DomUtil.create('div', 'i-wrapper', this._content);
        var html = '<div class="i-avatar">'
        html +=        '<div class="i-avatar-img">';
        html +=            '<img src="' + post.avatar + '" />';
        html +=        '</div>';
        html +=        '<div class="i-user">'
        html +=            post.full_name;
        html +=        '</div>';
        html +=    '</div>';
        html +=    '<div class="i-image">'
        html +=        '<img src="' + post.image.low_resolution.url + '" />';
        html +=    '</div>';
        html +=    '<div class="i-caption i-date">'
        // html +=        new Date(parseInt(post.created_time) * 1000).toDateString();
        html +=        this._formatDate(post.created_time);
        html +=    '</div>';
        html +=    '<div class="i-caption">'
        html +=        post.text;
        html +=    '</div>';
        html +=    '<div class="i-likes">'
        html +=        '<i class="fa fa-heart float-left" aria-hidden="true"></i>';
        html +=        '<div class="i-likes-count">' + post.likes.count + '</div>';
        html +=    '</div>';
        wrapper.innerHTML = html;

    },

    _safeParse : function (json) {
        try {
            var parsed = JSON.parse(json);
            return parsed;
        } catch (e) {
            console.log('parse error', e, json);
            return false;
        }
    },


});
