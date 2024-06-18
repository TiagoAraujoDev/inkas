"use strict";

const db = require("../db.js");
const express = require("express");
const router = express.Router();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const model = (/** @type {{ models: string; }} */ p) => {
  return {
    ports: { tableName: "smart.ports", idAttribute: "port_id" },
    berths: { tableName: "smart.berths", idAttribute: "berth_id" },
    facilities: { tableName: "smart.facilities", idAttribute: "facility_id" },
    users: { tableName: "auth.users", idAttribute: "user_id" },
    roles: { tableName: "auth.roles", idAttribute: "role" },
    perms: { tableName: "auth.perms", idAttribute: "perms" },
  }[p.models];
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL <models>
router.get("/:models", function (req, res, _next) {
  const m = model(req.params);
  db(m.tableName)
    .select()
    .where(req.query || {})
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

////////////////////////////////////////////////////
// Fetch One <model>
router.get("/:models/:model_id", function (req, res, _next) {
  const m = model(req.params);
  const id = { [m.idAttribute]: req.params.model_id };

  db(m.tableName)
    .first()
    .where(id)
    .then((out) => {
      if (!out) {
        console.log("here");
        throw new Error("user not found");
      } else {
        return res.status(200).jsonp(out);
      }
    })
    .catch((err) => {
      return res.status(404).json(err);
    });
});

////////////////////////////////////////////////////
// Create a new <model> an returns its id
router.post("/:models", function (req, res, _next) {
  // WARN: Should allow to create two users with the same info
  const m = model(req.params);

  db(m.tableName)
    .insert(req.body)
    .returning("*")
    .then((out) => res.status(201).jsonp(out[0]))
    .catch((err) => res.status(404).jsonp(err));
});

////////////////////////////////////////////////////
// Update a model by its id and return it
router.put("/:models/:model_id", function (req, res, _next) {
  // WARN: Responde with a 200 OK when doesn't find a user
  const m = model(req.params);
  const id = { [m.idAttribute]: req.params.model_id };

  db(m.tableName)
    .update(req.body)
    .returning("*")
    .where(id)
    .then((out) => res.status(200).jsonp(out[0]))
    .catch((err) => res.status(404).jsonp(err));
});

////////////////////////////////////////////////////
// Update a model by its id and return it
router.patch("/:models/:model_id", function (req, res, _next) {
  // WARN: Responde with a 200 OK when doesn't find a user
  const m = model(req.params);
  const id = { [m.idAttribute]: req.params.model_id };

  db(m.tableName)
    .update(req.body, { patch: true })
    .returning("*")
    .where(id)
    .then((out) => res.status(200).jsonp(out[0]))
    .catch((err) => res.status(404).jsonp(err));
});

////////////////////////////////////////////////////
// Delete a <model> by its id
router.delete("/:models/:model_id", function (req, res, _next) {
  const m = model(req.params);
  const id = { [m.idAttribute]: req.params.model_id };

  db(m.tableName)
    .del()
    .returning("*")
    .where(id)
    .then((out) => res.status(200).jsonp(out[0]))
    .catch((err) => res.status(404).jsonp(err));
});

////////////////////////////////////////////////////
module.exports = router;
