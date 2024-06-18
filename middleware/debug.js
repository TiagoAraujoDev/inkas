"use strict";

module.exports = (req, res, next) => {
  console.log("Method: ", req.method);
  console.log("Body  : ", req.body);
  console.log("Params: ", req.params);
  console.log("Query : ", req.query);
  next();
};
