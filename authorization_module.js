
const jwt = require("jsonwebtoken");
var express = require('express');
var router = express.Router();

var secret = "MrRoboto";

router.use("", (req, res,next) => {
    const token = req.header("x-auth-token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
    next();
});


module.exports = router;