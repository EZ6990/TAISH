var express = require('express');
var user_module = require('./user_module');
var authorization_module = require('./authorization_module');
var authentication_module = require('./authentication_module');
var poi_module = require('./point_of_interest_module');
var countries_module = require('./countries_module');

var app = express();
var port = 3000;


app.use(express.json());
app.use(express.urlencoded());

app.listen(port, function () {
    console.log('app start listening on port ' + port);
});

app.use(express.static(__dirname + '/public'));

app.use('/private',authorization_module);
app.use('/private/user',user_module);
app.use('/public',authentication_module);
app.use('/public',poi_module);
app.use('/public',countries_module);
