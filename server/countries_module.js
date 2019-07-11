var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();

router.use("/",(req,res,next) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/getCountries', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM Countries")
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        res.send(err)
    })
})

module.exports = router;