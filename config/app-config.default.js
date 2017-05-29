module.exports = {

    // title
    portal_title : '',
    domain : 'example.com',
    wordpress_domain : 'blog.example.no',

    redis : {
        // key for geojson
        key : 'any-unique-key',
        auth : 'redis-key-must-match-redis-config'
    },

    twitter : {
        consumer_key : '',
        consumer_secret : '',
        access_token : '',
        access_token_secret : '',
        timeout_ms : 60*1000,  
    },

     facebook : {
        app_id : '',
        title : 'Default Facebook post title',
    }

}