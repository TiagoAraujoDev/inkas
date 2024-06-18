"use strict";
const _ = require("lodash");
const fs = require("fs");
const url = require("url");
const getopt = require("node-getopt-long");

/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
const defaults = {
  port: process.env.INKAS_PORT || 3000,
  serverName: "inkas - NYX Knowledge Application Server",
  logFormat: "combined",
  logStream: process.stdout,
  auth: null,
  ssl: true,
  cors: {
    enable: true,
    options: {
      origin: [
        "http://localhost:4200",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://ec2-34-221-159-129.us-west-2.compute.amazonaws.com:8080",
        "http://sma-test-web-app.s3-website-us-west-2.amazonaws.com",
        "https://130.100.10.231",
        "https://sma.mrn.com.br",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "HEAD", "PATCH", "DELETE"],
      transports: ["websocket", "polling", "flashsocket"],
    },
  },
  http2: true,
  printAPI: false,
  verbose: false,
  nocache: true,
  cacheAge: 86400000,
  dbConn:
    process.env.PG_CONNECTION_STRING ||
    "postgres://Navalport@inkas.cnac8skkej7p.us-east-1.rds.amazonaws.com/Inkas",
  certRoot: "/etc/ssl/live/leviathan.nyxk.com.br",
  certFile: {
    ca: "chain.pem",
    key: "privkey.pem",
    cert: "fullchain.pem",
  },
  whitelist: [],
  blacklist: [],
  whitelistFile: null,
  blacklistFile: null,
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const integer = function (v) {
  return parseInt(v);
};
const version = function () {
  const cmd = require("shelljs").exec("svn info", { silent: true });

  if (cmd.code == 0) {
    const out = _.split(cmd.stdout, "\n");
    const rev = out[6].split(/:(.+)/)[1];
    const when = out[11].split(/:(.+)/)[1];

    console.log(defaults.serverName);
    console.log("\tRevision: %d", rev);
    console.log("\tReleased:%s\n", when);
  }

  return process.exit(0);
};

const options = getopt
  .configure(
    [
      ["printAPI|a!", { description: "Print out ALL exposed API mountpaths" }],
      ["ssl!", { description: "Enable HTTP/2 (default)" }],
      ["cors!", { description: "Enable CORS" }],
      ["verbose|v", { description: "Be verbose" }],
      ["version|V", { description: "Show version", on: version }],
      ["port|p=i", { description: "TCP Port", on: integer }],
      ["cacheAge|t=i", { description: "HTTP Cache maxAge", on: integer }],
      [
        "logFormat|F=s",
        {
          description: "LogFormat",
          test: ["dev", "combined", "common", "short", "tiny"],
        },
      ],
      [
        "whitelist|w=s@",
        {
          description: "Routes Whitelist",
          on: _.split,
          value: defaults.whitelist,
        },
      ],
      [
        "blacklist|b=s@",
        {
          description: "Routes Blacklist",
          on: _.split,
          value: defaults.blacklist,
        },
      ],
      ["whitelistFile=s", { description: "Routes Whitelist File" }],
      ["blacklistFile=s", { description: "Routes Blacklist File" }],
    ],
    {
      name: "inkas",
      commandVersion: 2.1,
      helpPrefix: defaults.serverName,
      helpPostfix: "Copyright 2015 (c) Antonio A. Russo",
      defaults: defaults,
    },
  )
  .process();

const pgURI = url.parse(options.dbConn);

options.pgConn = {
  user: pgURI.auth,
  host: pgURI.hostname,
  database: pgURI.pathname.replace(/^\//, ""),
};

if (options.whitelistFile) {
  try {
    fs.readFileSync(options.whitelistFile, "utf-8")
      .split(/\r?\n/)
      .forEach((e) => options.whitelist.push(e));
  } catch (err) {
    console.error(err);
  }
}

if (options.blacklistFile) {
  try {
    fs.readFileSync(options.blacklistFile, "utf-8")
      .split(/\r?\n/)
      .forEach((e) => options.blacklist.push(e));
  } catch (err) {
    console.error(err);
  }
}

module.exports = options;
