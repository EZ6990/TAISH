var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();


router.put('/insertDefaultPOIOrder', function (req, res) {
    // DButilsAzure.execQuery("SELECT PointOfInterestId , Priorety FROM FavoritePointsOfInterest WHERE UserId= "+req.body.username)
    // .then(function(result){
    //     res.send(result[1])
    // })
    let i = 1;
    for (let i = 0; i < req.body.POIId.length; i++) {
        console.log("here");
        DButilsAzure.execQuery("UPDATE FavoritePointsOfInterest SET Priorety = " + (i + 1) + " WHERE UserId= '" + req.decoded.username + "' AND PointOfInterestId= " + req.body.POIId[i])
            .then(function (result) {
                console.log("UPDATE FavoritePointsOfInterest SET Priorety = " + (i + 1) + " WHERE UserId= '" + req.deco + "' AND PointOfInterestId= " + req.body.POIId[i - 1]);
                i++;
            })
            .catch(function (err) {
                console.log(err)
                res.send(err)
            })
    }
    res.sendStatus(200);

    // .catch(function(err){
    //     console.log(err)
    //     res.send(err)
    // })
});

router.post('/insertReview', function (req, res, next) {
    DButilsAzure.execQuery("INSERT INTO Reviews (UserId,PointOfInterestId,Rate,Details,dateOfReview) VALUES( '" + req.decoded.username + "' , '" + req.body.POIId + "' , '" + req.body.Rate + "' , '" + req.body.Details + "' ,  CONVERT(smalldatetime, CURRENT_TIMESTAMP)  )")
        .then(function (result) {
            //   res.sendStatus(200)
            next();
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })

});

router.post('/insertReview', function (req, res) {
    DButilsAzure.execQuery(" select (AVG(cast(Rate as decimal(10,2)))/5*100) as Rate from Reviews where PointOfInterestId=" + req.body.POIId)
        .then(function (result) {
            DButilsAzure.execQuery("UPDATE PointsOfInterest set Rate= " + result[0]["Rate"] + " where Id = " + req.body.POIId)
                .then(function (result) {
                    res.sendStatus(200)
                })
                .catch(function (err) {
                    console.log(err)
                    res.send(err)
                })
        })
});

router.post('/savePOI', function (req, res) {
    DButilsAzure.execQuery("SELECT MAX(Priorety) FROM FavoritePointsOfInterest WHERE UserId= '" + req.decoded.username + "'")
        .then(function (result) {
            let priority = result[0][""] + 1;
            DButilsAzure.execQuery("INSERT INTO FavoritePointsOfInterest (UserId,PointOfInterestId,Priorety) VALUES('" + req.decoded.username + "', " + req.body.POIId + " , " + priority + ")")
                .then(function (result) {
                    res.sendStatus(200)
                })
                .catch(function (err) {
                    console.log(err)
                    res.send(err)
                })
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
});

router.delete('/removeSavedPOI', function (req, res) {

    DButilsAzure.execQuery("DECLARE @priorety INT " +
        "SET @priorety = (SELECT Priorety FROM FavoritePointsOfInterest WHERE UserID = '" + req.decoded.username
        + "' AND PointOfInterestId =" + req.body.POIId + ") " +
        "UPDATE FavoritePointsOfInterest SET Priorety = Priorety - 1 WHERE Priorety > @priorety AND UserID = '" +
        req.decoded.username + "' DELETE FROM FavoritePointsOfInterest WHERE UserID = '" +
        req.decoded.username + "' AND PointOfInterestId = " + req.body.POIId)

        .then(function (result) {
            res.sendStatus(200)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })

});

router.get('/getReccomendedPOI', function (req, res) {
    const user_data = {
        username: req.decoded.username
    };
    DButilsAzure.execQuery("SELECT CategoryId FROM UsersCategories WHERE UserId = '" + user_data.username + "'")
        .then(function (result) {
            let allpromisess = []
            for (index = 0; index < result.length; index++) {
                let row = result[index];
                allpromisess.push(DButilsAzure.execQuery("SELECT poi.id,poi.Name,poi.Rate,poi.Description,poi.Picture "
                    + "FROM PointsOfInterestCategories pc JOIN PointsOfInterest poi on (pc.PointOfIntrestId = poi.Id) "
                    + "WHERE pc.CategoryId = " + row['CategoryId']
                    + "AND poi.id NOT IN (SELECT PointOfInterestId FROM FavoritePointsOfInterest WHERE UserId = '" + user_data.username + "')"));

                allpromisess.push(DButilsAzure.execQuery("SELECT * FROM Categories WHERE Id = " + row['CategoryId']));
            }
            Promise.all(allpromisess).then(function (data) {
                let RecommendedPointOfInterest = [];
                for (index = 0; index < data.length; index += 2) {
                    let row = data[index][0];
                    row['Categories'] = data[index + 1];
                    RecommendedPointOfInterest.push(row);
                }
                res.send(RecommendedPointOfInterest);
            })
        })
        .catch(function (err) {
            console.log("error1 : " + err)
            res.send(err)
        })
})

router.get('/getSavedPOI', function (req, res) {
    console.log(req.decoded);
    const user_data = {
        username: req.decoded.username,
    };
    DButilsAzure.execQuery("SELECT poi.id,poi.Name,poi.Rate,poi.Description,poi.Picture FROM FavoritePointsOfInterest fpoi JOIN PointsOfInterest poi ON (poi.Id = fpoi.PointOfInterestId) Where fpoi.UserId = '" + user_data.username + "' ORDER BY fpoi.Priorety ASC")
        .then(function (result) {
            let allpromisess = [];
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
            console.log("error1 : " + err)
            res.send(err)
        })
})


module.exports = router;