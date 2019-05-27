var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();


router.get('/getALLPOI', function (req, res) {
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest")
        .then(function (result) {
            let allpromisess = []
            for (index = 0; index < result.length; index++) {
                let row = result[index];
                allpromisess.push(row)
                allpromisess.push(DButilsAzure.execQuery("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['id']))
            }
            Promise.all(allpromisess).then(function (data) {
                let FavoritePointOfInterest = [];
                for (index = 0; index < data.length; index += 2) {
                    let row = data[index];
                    row['Categories'] = data[index + 1];
                    FavoritePointOfInterest.push(row)
                }
                res.send(FavoritePointOfInterest);
            })
                .catch(function (err) {
                    console.log(err)
                    res.send(err)
                })
        })
    });


    router.get('/getPOI/:POIId', function (req, res) {
        DButilsAzure.execQuery("SELECT * FROM PointsOfInterest WHERE Id = " + req.params.POIId)
            .then(function (result) {
                let allpromisess = []
                for (index = 0; index < result.length; index++) {
                    let row = result[index];
                    allpromisess.push(row)
                    allpromisess.push(DButilsAzure.execQuery("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['id']))
                }
                Promise.all(allpromisess).then(function (data) {
                    let FavoritePointOfInterest = [];
                    for (index = 0; index < data.length; index += 2) {
                        let row = data[index];
                        row['Categories'] = data[index + 1];
                        FavoritePointOfInterest.push(row)
                    }
                    res.send(FavoritePointOfInterest);
                })
            })
                .catch(function (err) {
                    console.log(err)
                    res.send(err)
                })

});
    router.get('/getPOIReviews/:POIId/:integer', function (req, res) {
        let s = "";
        if (req.params.integer == -1)
            s = "SELECT * FROM Reviews WHERE PointOfInterestId= ";
        else {
            s = "SELECT * TOP " + req.params.integer + " FROM Reviews WHERE PointOfInterestId= ";
        }
        DButilsAzure.execQuery(s + req.params.POIId)
            .then(function (result) {
                res.status(200).send(result)
            })
            .catch(function (err) {
                console.log(err)
                res.send(err)
            })

    })
    module.exports = router;