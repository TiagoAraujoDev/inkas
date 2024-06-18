"use strict";

const db = require("../db.js");
const CognitoExpress = require("cognito-express");

//Initializing CognitoExpress constructor
const cognitoExpress = new CognitoExpress({
  region: "us-west-2",
  cognitoUserPoolId: "us-west-2_01flwXB0J",
  tokenUse: "access", //  Possible Values: access | id
  tokenExpiration: 3600000, //  Up to default expiration of 1 hour (3600000 ms)
});

module.exports = (req, res, next) => {
  const [method, token] = req.headers.authorization.split(" ");

  if (!token || method !== "Bearer") {
    return res.status(401).send("Access Token missing from header");
  }

  cognitoExpress.validate(token, async (err, response) => {
    //If API is not authenticated, Return 401 with error message.
    if (err) {
      return res.status(401).send(err);
    }

    // Idempotent methods does not have body.
    if (req.method === "GET" || req.method === "OPTIONS") {
      return next();
    }

    // If has body AND body claims an assign_id check if token's username has such assign
    if (req.body && req.body.assign_id) {
      await db("auth.assign_users")
        .select()
        .where({ username: response.username, assign_id: req.body.assign_id })
        .then((out) => {
          if (!out.length) {
            return res
              .status(401)
              .send("Access Token is not authorized for this assign");
          }
        })
        .catch(() =>
          res.status(401).send("User is not assigned to this assign_id"),
        );
    }

    res.user = response;
    return next();
  });
};
