
const jwt = require("jsonwebtoken");
var express = require('express');
var DButilsAzure = require('./DButils');
var router = express.Router();

var secret = "MrRoboto";
router.use("/",(req,res,next) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post("/login", (req, res) => {
    console.log("walid is HERE");
    const user_data = {
        username: req.body.username,
        password: req.body.password,
    };
    payload = { username: user_data.username, admin: false };
    options = { expiresIn: "1d" };
    const token = jwt.sign(payload, secret, options);
    DButilsAzure.execQuery("SELECT * FROM Users WHERE Username = '" + user_data.username + "' AND Password = '" + user_data.password + "'")
    .then(function(result){
        if (result.length == 1)
            res.status(200).send(token)
        else{
            res.status(401).send("Username or Password are incorrect")
        }
    })
    .catch(function(err){
        console.log(err)
        res.send(err)
    })
});

router.post('/restorePassword', function (req, res) {
    const user_data = {
        username: req.body.username,
        question1: req.body.question1,
        answer1: req.body.answer1,
        question2: req.body.question2,
        answer2: req.body.answer2
    };
    console.log(user_data);
    DButilsAzure.execQuery("SELECT Password FROM Users where Username = '" + user_data.username + "' and SecurityQuestion1 = '" + user_data.question1 + "' and SecurityAnswer1 = '" + user_data.answer1 + "'"
    + " and SecurityQuestion2 = '" + user_data.question2 + "' and SecurityAnswer2 = '" + user_data.answer2 + "'")
        .then(function (result) {
            res.status(401).send(result)
        })
        .catch(function (err) {
            console.log(err)
            res.send(err)
        })
})

router.post('/registerClient', function (req, res) {
    const user_data = {
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        question1: req.body.question1,
        answer1: req.body.answer1,
        question2: req.body.question2,
        answer2: req.body.answer2,
        categories: req.body.categories
    };
    if (user_data.question1 == user_data.question2)
        res.status(400).send("please specify 2 different questions");
    if (user_data.data.categories.length < 2)
        res.status(400).send("need at least 2 favorite categories");

    DButilsAzure.execQuery("INSERT INTO Users (Username,Password,Firstname,Lastname,City,Country,Email,SecurityQuestion,SecurityAnswer)"
        + " VALUES ('" + user_data.username + "','" + user_data.password + "','" + user_data.firstname + "','" + user_data.lastname + "','" + user_data.city + "'," + user_data.country + ",'" + user_data.email + "','" + user_data.question1 + "','" + user_data.answer1 + "','" + user_data.question1 + "','" + user_data.answer2 + "' )")
        .then(function (result) {
            let categoriesPromises = []
            for (index = 0; index < req.body.categories.length; index++) {
                categoriesPromises.push(DButilsAzure.execQuery("INSERT INTO UsersCategories (UserId,CategoryId) VALUES ('" + user_data.username + "'," + user_data.categories[index] + ")"))
            }
            Promise.all(categoriesPromises).then(function (data) {
                if (data.length != 0 && data[0].length != 0) {
                    let delusercategories = DButilsAzure.execQuery("DELETE FROM UsersCategories WHERE UserId = '" + user_data.username + "'")
                    let deluser = DButilsAzure.execQuery("DELETE FROM Users WHERE Username = '" + user_data.username + "'")
                    Promise.all([delusercategories, deluser]).then(function (data) {
                        console.log("success delete Category")
                        console.log("success delete user")
                    })
                    console.log("error1 : " + data)
                }
            })
        })
        .then(function (result) {
            res.status(401).send(result)
        })
        .catch(function (err) {
            console.log(err)
            // DButilsAzure.execQuery("DELETE FROM UsersCategories WHERE UserId = '" +user_data.username+"'").then(function(data){
            //     console.log("success delete user categories")
            // })
            // DButilsAzure.execQuery("DELETE FROM Users WHERE Username = '" +user_data.username+"'").then(function(data){
            //     console.log("success delete user")
            // })
            res.send(err)
        })
})

module.exports = router;