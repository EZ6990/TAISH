var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');

var port = 3000;

app.use(express.json());
app.use(express.urlencoded());

app.listen(port, function () {
    console.log('app start listening on port ' + port);
});

app.get('/getALLPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest")
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
})


app.post('/restorePassword', function(req, res){
    const user_data = {
        username: req.body.username,
        question: req.body.question,
        answer: req.body.answer
    };
    console.log(user_data);
    DButilsAzure.execQuery("SELECT Password FROM Users where Username = '" + user_data.username +"' and SecurityQuestion = '" +user_data.question +"' and SecurityAnswer = '" + user_data.answer +"'")
    .then(function(result){
        res.status(401).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
})

app.get('/getSavedPOI', function(req, res){
    const user_data = {
        username: req.body.username,
    };
    let allpromisess = []
    allpromisess.push(
        DButilsAzure.execQuery("SELECT poi.id,poi.Name,poi.Rate,poi.Description,poi.Picture FROM FavoritePointsOfInterest fpoi JOIN PointsOfInterest poi ON (poi.Id = fpoi.PointOfInterestId) Where fpoi.UserId = '" + user_data.username + "'")
        .then(function(result){
                for (index = 0; index < result.length; index++) {
                    let row = result[index];
                    DButilsAzure.execQuery("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['id'])
                }
        })
        .catch(function(err){
            console.log("error1 : " + err)
            res.send(err)
        })
    )
    Promise.all(allpromisess).then(function(data)
    {
        console.log(data);
    });
})