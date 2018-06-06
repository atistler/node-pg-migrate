"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dropExtension = exports.createExtension = undefined;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("../utils");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const createExtension = (exports.createExtension = (
  extensions,
  { ifNotExists, schema } = {}
) => {
  if (!_lodash2.default.isArray(extensions)) extensions = [extensions]; // eslint-disable-line no-param-reassign
  return _lodash2.default.map(
    extensions,
    extension =>
      _utils.template`CREATE EXTENSION${
        ifNotExists ? " IF NOT EXISTS" : ""
      } "${extension}"${schema ? ` SCHEMA "${schema}"` : ""};`
  );
});

const dropExtension = (exports.dropExtension = (
  extensions,
  { ifExists, cascade } = {}
) => {
  if (!_lodash2.default.isArray(extensions)) extensions = [extensions]; // eslint-disable-line no-param-reassign
  return _lodash2.default.map(
    extensions,
    extension =>
      _utils.template`DROP EXTENSION${
        ifExists ? " IF EXISTS" : ""
      } "${extension}"${cascade ? " CASCADE" : ""};`
  );
});

// setup reverse functions
createExtension.reverse = dropExtension;
