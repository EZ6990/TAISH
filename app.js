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
        DButilsAzure.execQuery("SELECT poi.id,poi.Name,poi.Rate,poi.Description,poi.Picture FROM FavoritePointsOfInterest fpoi JOIN PointsOfInterest poi ON (poi.Id = fpoi.PointOfInterestId) Where fpoi.UserId = '" + user_data.username + "'")
        .then(function(result){
                let allpromisess = []
                for (index = 0; index < result.length; index++) {
                    let row = result[index];
                    allpromisess.push(row)
                    allpromisess.push(DButilsAzure.execQuery("SELECT c.Id,c.Name,c.Description FROM PointsOfInterestCategories pc JOIN Categories c ON (pc.CategoryId = c.Id) WHERE pc.PointOfIntrestId = " + row['id']))
                }
                Promise.all(allpromisess).then(function(data)
                {
                    let FavoritePointOfInterest = [];
                    for (index = 0; index < data.length; index+=2) {
                        let row = data[index];
                        row['Categories'] = data[index+1];
                        FavoritePointOfInterest.push(row)
                    }
                    res.send(FavoritePointOfInterest);
                })
        })
        .catch(function(err){
            console.log("error1 : " + err)
            res.send(err)
        })
})

////////////////DANNY////////////////////////////
app.put('/insertDefaultPOIOrder', function(req, res){
    // DButilsAzure.execQuery("SELECT PointOfInterestId , Priorety FROM FavoritePointsOfInterest WHERE UserId= "+req.body.username)
    // .then(function(result){
    //     res.send(result[1])
    // })
    let i=1;
        for(let i=0;i<req.body.POIName.length;i++){
        console.log("here");
        DButilsAzure.execQuery("UPDATE FavoritePointsOfInterest SET Priorety = "+(i+1)+" WHERE UserId= '"+req.body.username +"' AND PointOfInterestId= "+req.body.POIId[i])
        .then(function(result){
            console.log("UPDATE FavoritePointsOfInterest SET Priorety = "+(i+1)+" WHERE UserId= '"+req.body.username +"' AND PointOfInterestId= "+req.body.POIId[i-1]);
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

app.get('/getPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest WHERE Id = "+req.body.POIId)
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })

});

app.post('/insertReview', function(req, res,next){
    DButilsAzure.execQuery("INSERT INTO Reviews (UserId,PointOfInterestId,Rate,Details) VALUES( '"+req.body.username+"' , '"+ req.body.POIId+"' , '"+req.body.Rate+"' , '"+ req.body.Details +"' )")
    .then(function(result){
     //   res.sendStatus(200)
     next();
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })

});

app.post('/insertReview', function(req, res){
    DButilsAzure.execQuery(" select AVG(cast(Rate as decimal(10,2)))/5*100  from Reviews   where PointOfInterestId="+req.body.POIId)
    .then(function(result){
      
        DButilsAzure.execQuery("UPDATE PointsOfInterest set Rate= "+ result[0][""] +" where Id = "+req.body.POIId)
        .then(function(result){
             res.sendStatus(200)
           })
           .catch(function(err){
               console.log(err)
               res.send(err)
           })

    })

});

app.post('/savePOI', function(req, res){
    DButilsAzure.execQuery("SELECT MAX(Priorety) FROM FavoritePointsOfInterest WHERE UserId= '" +req.body.username+"'")
    .then(function(result){
    let priority=result[0][""]+1;
    DButilsAzure.execQuery("INSERT INTO FavoritePointsOfInterest (UserId,PointOfInterestId,Priorety) VALUES('"+req.body.username+"', "+ req.body.POIId+" , "+ priority+")")
    .then(function(result){
        res.sendStatus(200)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
})
.catch(function(err){
    console.log(err)
    res.send(err)
})
});

app.delete('/removeSavedPOI', function(req, res){


    DButilsAzure.execQuery("DECLARE @priorety INT "+
    "SET @priorety = (SELECT Priorety FROM FavoritePointsOfInterest WHERE UserID = '" +req.body.username
    +"' AND PointOfInterestId =" +req.body.POIId+") "+
    "UPDATE FavoritePointsOfInterest SET Priorety = Priorety - 1 WHERE Priorety > @priorety AND UserID = '"+
    req.body.username+"' DELETE FROM FavoritePointsOfInterest WHERE UserID = '"+
    req.body.username+"' AND PointOfInterestId = " + req.body.POIId )
   
    .then(function(result){
        res.sendStatus(200)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })

});

////////////////DANNY////////////////////////////