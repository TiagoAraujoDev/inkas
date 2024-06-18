///////////////////////////////////////////////////////////////////////////////
// Debugging
///////////////////////////////////////////////////////////////////////////////
const debug = require("debug");

const sma = debug("sma");
sma.log = console.log.bind(console);

module.exports = {
  debug,
  sma,

  env: sma.extend("env"),

  laser: sma.extend("laser"),
  loads: sma.extend("loads"),
  alarms: sma.extend("alarms"),
  daemons: sma.extend("daemons"),
  metocean: sma.extend("metocean"),

  relays: sma.extend("relays"),
  display: sma.extend("display"),
  modbus: sma.extend("modbus"),
  buzzer: sma.extend("buzzer"),

  websocket: sma.extend("websocket"),
  // action:    sma.extend('action'),
  docking: sma.extend("docking"),
  activate: sma.extend("activate"),
};
