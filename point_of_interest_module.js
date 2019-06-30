var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();

router.use("/", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/getALLPOI', function (req, res) {
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest")
        .then(function (result) {
            let allpromisess = []
            for (index = 0; index < result.length; index++) {
                let row = result[index];
                allpromisess.push(row)
                allpromisess.push(DButilsAzure.execQuery("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['Id']))
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

router.put('/POIViewIncrease', function (req, res) {
    DButilsAzure.execQuery("UPDATE PointsOfInterest SET point_viewed = point_viewed + 1 WHERE Id= " + req.body.POIId)
        .then(function (result) {
            res.sendStatus(200)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
})

router.get('/getPOI/:POIId', function (req, res) {
    console.log("SELECT * FROM PointsOfInterest WHERE Id = " + req.params.POIId);
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest WHERE Id = " + req.params.POIId)
        .then(function (result) {
            let allpromisess = []
            for (index = 0; index < result.length; index++) {
                console.log(result[index])
                let row = result[index];
                console.log("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['Id']);
                allpromisess.push(row)
                allpromisess.push(DButilsAzure.execQuery("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['Id']))
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
    DButilsAzure.execQuery(s + req.params.POIId + " ORDER BY dateOfReview")
        .then(function (result) {
            res.status(200).send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
});

router.get('/getAllCategories', function (req, res) {
    DButilsAzure.execQuery("SELECT * FROM Categories")
        .then(function (result) {
            res.status(200).send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
});

module.exports = router;
