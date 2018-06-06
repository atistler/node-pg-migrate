"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sql = undefined;

var _utils = require("../utils");

// eslint-disable-next-line import/prefer-default-export
const sql = (exports.sql = (...args) => {
  // applies some very basic templating using the utils.p
  let s = (0, _utils.t)(...args);
  // add trailing ; if not present
  if (s.lastIndexOf(";") !== s.length - 1) {
    s += ";";
  }
  return s;
});
