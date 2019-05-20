var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');


app.use(express.json());
app.use(express.urlencoded());

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

app.get('/getALLPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest")
    .then(function(result){
        res.send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

app.put('/insertDefaultPOIOrder', function(req, res){
    // DButilsAzure.execQuery("SELECT PointOfInterestId , Priorety FROM FavoritePointsOfInterest WHERE UserId= "+req.body.username)
    // .then(function(result){
    //     res.send(result[1])
    // })
    let i=1;
        for(let i=0;i<req.body.POIName.length;i++){
        console.log("here");
        DButilsAzure.execQuery("UPDATE FavoritePointsOfInterest SET Priorety = "+(i+1)+" WHERE UserId= '"+req.body.username +"' AND PointOfInterestId= "+req.body.POIName[i])
        .then(function(result){
            console.log("UPDATE FavoritePointsOfInterest SET Priorety = "+(i+1)+" WHERE UserId= '"+req.body.username +"' AND PointOfInterestId= "+req.body.POIName[i-1]);
            i++;
        })
           
    
      .catch(function(err) {
        console.log(err)
        res.send(err)
    
    })}
    res.sendStatus(200);
  
    // .catch(function(err){
    //     console.log(err)
    //     res.send(err)
    // })
});