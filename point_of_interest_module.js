var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();


router.get('/getALLPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest")
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
})


router.get('/getPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest WHERE Id = "+req.body.POIId)
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })

});

module.exports = router;