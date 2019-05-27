
const jwt = require("jsonwebtoken");
var express = require('express');
var router = express.Router();

router.post("/", (req, res,next) => {
    const token = req.header("x-auth-token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        req.decoded = decoded;
        if (req.decoded.admin)
            res.status(200).send({ result: "Hello admin." });
        else
            res.status(200).send({ result: "Hello user." });
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
    next();
});


module.exports = router;