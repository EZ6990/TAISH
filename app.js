var express = require('express');
var DButilsAzure = require('./DButils');
var user_module = require('./user_module');
var authorization_module = require('./authorization_module');
var authentication_module = require('./authentication_module');
var poi_module = require('./point_of_interest_module');

var secret = "MrRoboto";
var app = express();
var port = 3000;

app.use(express.json());
app.use(express.urlencoded());

app.listen(port, function () {
    console.log('app start listening on port ' + port);
});


app.use('/private',authorization_module);
app.use('/private/user',user_module);
app.use('/public',authentication_module);
app.use('/public',poi_module);


app.get('/getAllCategories', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM Categories")
    .then(function(result){
        res.status(200).send(result)
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
})