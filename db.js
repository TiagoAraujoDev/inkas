"use strict";

const knex = require("knex");
require("dotenv/config");

///////////////////////////////////////////////////////////////////////////////
// DB instance
///////////////////////////////////////////////////////////////////////////////

module.exports = knex({
  client: "pg",
  connection: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL ? { rejectUnauthorized: false } : false,
  },
});
