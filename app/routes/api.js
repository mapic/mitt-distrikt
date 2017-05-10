module.exports = {

    note : function (req, res) {
        console.log('api.note', req.body);

        res.send({
            err : null, 
            fn : 'api.note'
        })
    }

}
