"use strict";

const fs = require("fs");
// const io = require('socket.io');
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const history = require("connect-history-api-fallback");
const compress = require("compression");
const isLambda = require("is-lambda");
// const child_process = require("child_process");

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

// const db = require("./db");
const debug = require("./debug.js");
// const action = require('./action');
const config = require("./config.js");

debug.env(process.env);

///////////////////////////////////////////////////////////////////////////////
// Start express.js
///////////////////////////////////////////////////////////////////////////////
console.log("*inkas => =======  Starting SMA Inkas Server  =======");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compress());
app.use(
  history({
    rewrites: [
      {
        from: /^\/api.*$/,
        to: (c) => c.parsedUrl.pathname,
      },
    ],
  }),
);

// Logger
app.use(
  morgan("tiny", {
    skip: (_req, res) => res.statusCode < 400,
  }),
);

/* if (config.blacklist.length) {
	const delist = require("./middleware/delist");
	app.use(delist({ blacklist: config.blacklist, whitelist: config.whitelist }));
} */

///////////////////////////////////////////////////////////////////////////////
// Use Auth0 middleware
///////////////////////////////////////////////////////////////////////////////
if (config.auth) {
  // Define middleware that validates incoming bearer tokens using JWKS
  app.use(
    jwt({
      audience: config.auth.audience,
      issuer: `https://${config.auth.domain}/`,
      algorithm: ["RS256"],
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${config.auth.domain}/.well-known/jwks.json`,
      }),
    }),
  );
}

///////////////////////////////////////////////////////////////////////////////
// CORS & cache
///////////////////////////////////////////////////////////////////////////////
if (config.cors.enable) {
  app.use(cors(config.cors.options));
}

// Disable cache
if (config.nocache) {
  app.use(function (_req, res, next) {
    res.header("Cache-Control", "no-cache");
    next();
  });
}

///////////////////////////////////////////////////////////////////////////////
// Load Routes
///////////////////////////////////////////////////////////////////////////////
const appDir = path.join(__dirname, "webapp");
const apiDir = path.join(__dirname, "routes");

// Static APP Route - Only useful on local setups
if (!isLambda) {
  app.use("/", express.static(appDir));
}

// BodyParse
// const bodyParser  = require('body-parser');
// app.use(bodyParser.json());

// Server API Routes
fs.readdir(apiDir, { withFileTypes: true }, (error, files) => {
  if (error) {
    console.error("*inkas => Unable to load API routes");
    return process.exit(1);
  } else {
    files
      .filter((f) => f.isFile && path.extname(f.name) === ".js")
      .map((f) => path.basename(f.name, ".js"))
      .forEach((f) => app.use(`/api/${f}`, require(path.join(apiDir, f))));
  }
});

///////////////////////////////////////////////////////////////////////////////
// Run and export server - AWS Lambda
///////////////////////////////////////////////////////////////////////////////
if (isLambda) {
  const lambda = require("aws-serverless-express");

  const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
  app.use(awsServerlessExpressMiddleware.eventContext());

  // Create Server Less Instance
  const server = lambda.createServer(app);

  console.log(`*inkas => Listening to HTTP at AWS Lambda`);

  // Lambda Exports
  exports.handler = (event, context) => {
    lambda.proxy(server, event, context);
  };

  // TODO handle socket
} else {
  const server = app.listen(config.port, "0.0.0.0", (error) => {
    if (error) {
      console.error(`*inkas => Express listen ${error.message}`);
      return process.exit(1);
    } else {
      console.log(`*inkas => Listening to HTTP at port TCP/${config.port}`);
    }
  });

  // const ioApp = io(server, { cors: config.cors.options, allowEIO3: true, });

  // ioApp.on('connect', socket => {
  //     const address = socket.request.connection.remoteAddress;
  //     debug.websocket(`*inkas => Connection from ${ address }`);
  //     // TODO events from from config
  //     [ 'laser', 'loads', 'alarm' ].forEach(eventName => socket.on(eventName, message => {
  //         // debug.websocket(`*inkas => ${eventName} emitted from ${address}`);
  //         ioApp.sockets.emit(eventName, message);
  //     }));
  // });

  module.exports = server;
}

///////////////////////////////////////////////////////////////////////////////
// Handle uncaught exceptions
///////////////////////////////////////////////////////////////////////////////
process.on("uncaughtException", (error, origin) => {
  console.error("*inkas => Uncaught Exception at:", origin);
  console.error("*inkas => ", error);
});

process.on("unhandledRejection", (error, origin) => {
  console.error("*inkas => Unhandled Rejection at:", origin);
  console.error("*inkas => ", error.message);
});
