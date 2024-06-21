"use strict";

const _ = require("lodash");
const db = require("../db.js");
const express = require("express");
const router = express.Router();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/", async (req, res, _next) => {
  db("auth.users")
    .select()
    .where(req.query || {})
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post("/", function (req, res, _next) {
  db("auth.users")
    .insert(req.body)
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/:user_id", function (req, res, _next) {
  db("auth.users")
    .first()
    .where(req.params)
    .then((user) => {
      const ep = db("auth.endpoints").select().where(req.params);

      const st = db("auth.staff_req")
        .select()
        .join("auth.requests", "staff.request_id", "requests.request_id")
        // .join('auth.orgs',     'staff.org_id',      'orgs.org_id')
        .where(req.params);
      Promise.all([ep, st]).then(([endpoints, staff]) =>
        res.status(200).jsonp({ ...user, endpoints, staff }),
      );
    })
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.delete("/:user_id", function (req, res, _next) {
  db("auth.users")
    .del()
    .where(req.params)
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.patch("/:user_id", function (req, res, _next) {
  db("auth.users")
    .update(req.body, { patch: true })
    .where(req.params)
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/:user_id/endpoints", function (req, res, _next) {
  db("auth.endpoints")
    .select()
    .where(req.params)
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post("/:user_id/endpoints", function (req, res, _next) {
  db("auth.endpoints")
    .insert(req.body)
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.delete("/:user_id/endpoints/:endpoint_id", function (req, res, _next) {
  db("auth.endpoints")
    .del()
    .where(req.params)
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post("/:user_id/staff", function (req, res, _next) {
  db("auth.staff")
    .insert({ ...req.body, ...req.params })
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/:user_id/staff", function (req, res, _next) {
  db("auth.staff")
    .select()
    .join("auth.requests", "staff.request_id", "requests.request_id")
    .join("auth.orgs", "staff.org_id", "orgs.org_id")
    .where(req.params)
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/:user_id/assigns", function (req, res, _next) {
  db("auth.assigns")
    .select()
    .join("auth.requests", "assigns.request_id", "requests.request_id")
    .join("auth.orgs", "assigns.org_id", "orgs.org_id")
    .where(req.params)
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post("/:user_id/assigns", function (req, res, _next) {
  db("auth.assigns")
    .insert({ ...req.body, ...req.params })
    .returning("*")
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/username/:username", function (req, res, _next) {
  db("auth.users")
    .first()
    .where(req.params)
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/stages/:username", function (req, res, _next) {
  db("smart.users_dockings")
    .select()
    .where(req.params)
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get("/scopes/:username", function (req, res, _next) {
  db("auth.users_scopes")
    .select()
    .where(req.params)
    .then((out) => res.status(200).jsonp(out))
    .catch((err) => res.status(404).jsonp(err));
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.put("/:user_id/roles", async (req, res, _next) => {
  try {
    const data = _.pick({ ...req.params, ...req.body }, ["user_id", "role"]);
    await db("auth.user_roles").insert(data).onConflict().ignore();
    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json(err);
  }
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.delete("/:user_id/roles", async (req, res, _next) => {
  try {
    const data = _.pick({ ...req.params, ...req.body }, ["user_id", "role"]);
    await db("auth.user_roles").where(data).del();
    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json(err);
  }
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
module.exports = router;
