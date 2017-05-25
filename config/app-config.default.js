module.exports = {

    // title
    portal_title : '',
    domain : 'example.com',
    wordpress_domain : 'blog.example.no',

    redis : {
        // key for geojson
        geojson : 'any-unique-key',
        auth : 'redis-key-must-match-redis-config'
    },

    twitter : {
        consumer_key : '',
        consumer_secret : '',
        access_token : '',
        access_token_secret : '',
        timeout_ms : 60*1000,  
    }

}