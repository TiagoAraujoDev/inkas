"use strict";

const express = require("express");
const _ = require("lodash");
const db = require("../db.js");
const router = express.Router();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const model = (/** @type {{ model: string; }} */ p) => {
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
router.get("/:models", async (req, res, _next) => {
  try {
    const m = model(req.params);
    if (!m) return res.status(400).json({ message: "resource not found!" });
    const users = await db(m.tableName)
      .select()
      .where(req.query || {});
    if (!users.length !== 0) return res.status(400).json(users);
    return res.status(200).jsonp(users);
  } catch (err) {
    return res.status(500).json(err);
  }
});

////////////////////////////////////////////////////
// Fetch One <model>
router.get("/:models/:model_id", async (req, res, _next) => {
  try {
    const m = model(req.params);
    if (!m) return res.status(400).json({ message: "Model not found" });
    const id = { [m.idAttribute]: req.params.model_id };
    const user = await db(m.tableName).first().where(id);
    if (!user) return res.status(400).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

////////////////////////////////////////////////////
// Create a new <model> an returns its id
router.post("/:models", async (req, res, _next) => {
  try {
    const m = model(req.params);
    if (!m) return res.status(400).json({ message: "Model not found" });
    const user = await db(m.tableName).insert(req.body).returning("*");
    return res.status(201).jsonp(user[0]);
  } catch (err) {
    return res.status(500).json(err);
  }
});

////////////////////////////////////////////////////
// Update a model by its id and return it
router.put("/:models/:model_id", async (req, res, _next) => {
  try {
    const m = model(req.params);
    if (!m) return res.status(400).json({ message: "Model not found" });
    const id = { [m.idAttribute]: req.params.model_id };
    const user = await db(m.tableName)
      .update(req.body)
      .returning("*")
      .where(id);
    return res.status(201).jsonp(user[0]);
  } catch (err) {
    return res.status(500).json(err);
  }
});

////////////////////////////////////////////////////
// Update a model by its id and return it
router.patch("/:models/:model_id", async (req, res, _next) => {
  try {
    const m = model(req.params);
    if (!m) return res.status(400).json({ message: "Model not found" });
    const id = { [m.idAttribute]: req.params.model_id };
    const user = await db(m.tableName)
      .update(req.body, { patch: true })
      .returning("*")
      .where(id);
    return res.status(200).jsonp(user[0]);
  } catch (err) {
    return res.status(500).json(err);
  }
});

////////////////////////////////////////////////////
// Delete a <model> by its id
router.delete("/:models/:model_id", async (req, res, _next) => {
  try {
    const m = model(req.params);
    if (!m) return res.status(400).json({ message: "Model not found" });
    const id = { [m.idAttribute]: req.params.model_id };
    const user = await db(m.tableName).del().returning("*").where(id);
    return res.status(200).jsonp(user[0]);
  } catch (err) {
    return res.status(500).json(err);
  }
});

////////////////////////////////////////////////////
module.exports = router;
