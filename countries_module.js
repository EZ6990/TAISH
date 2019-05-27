var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();

router.get('/getCountries', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM SELECT * FROM Countries")
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
})