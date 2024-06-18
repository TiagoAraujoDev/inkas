"use strict";

const db = require("../db.js");
const express = require("express");
const router = express.Router();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const model = (p) => {
  return {
    boardsides: { tableName: "smart.boardsides", idAttribute: "boardside_id" },
    countries: { tableName: "smart.countries", idAttribute: "country_id" },
    docktypes: { tableName: "smart.docktypes", idAttribute: "docktype_id" },
    navstatus: { tableName: "smart.navstatus", idAttribute: "navstatus_id" },
    vesseltypes: {
      tableName: "smart.vesseltypes",
      idAttribute: "vesseltype_id",
    },
  }[p.models];
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL <models>
router.get("/:models", function (req, res, next) {
  const m = model(req.params);
  db(m.tableName)
    .select()
    .where(req.query || {})
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

////////////////////////////////////////////////////
module.exports = router;
