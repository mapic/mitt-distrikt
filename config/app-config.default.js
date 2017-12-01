module.exports = {

    // title
    domain : 'demo.mitt-distrikt.no.',
    wordpress_domain : 'blog.mitt-distrikt.no',
    portal_title : 'Mitt Distrikt',
    default_tag : 'mittdistrikt',
    hashtag : 'MittDistrikt',
    instagram_tag : 'mittdistrikt',

    redis : {

        // key for geojson
        key : 'demo-v1',

        // redis auth
        auth : '',

        // key for config
        config : 'demo-config-v1',
    },

    twitter : {
        consumer_key : '',
        consumer_secret : '',
        access_token_key : '',
        access_token_secret : '',
        timeout_ms : 60*1000,
    },

    facebook : {
        app_id : '',
        title : '',
    },

    email : {

        // subject header
        subject : 'Nytt innlegg på MittDistrikt.no',        

        // emails that will receive notifications
        recipients : ['knutole@mitt-distrikt.no'],

        // support mailto
        support_mailto : 'knutole@mitt-distrikt.no',

        // support subject
        support_subject : 'Support for Mitt Distrikt',

        // config for email
        config : {
            service : 'gmail',
            auth : {
                user : 'knutole@mitt-distrikt.no',
                pass : ''
            },
            port: 465,
            secure : true,
            bcc : ['knutole@mitt-distrikt.no'],
            from : 'Mitt Distrikt <knutole@mitt-distrikt.no>'
        },
    }

}
