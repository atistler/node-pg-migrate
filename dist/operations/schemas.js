"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameSchema = exports.createSchema = exports.dropSchema = undefined;

var _utils = require("../utils");

const dropSchema = (exports.dropSchema = (
  schemaName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP SCHEMA${ifExistsStr} "${schemaName}"${cascadeStr};`;
});

const createSchema = (exports.createSchema = (
  schemaName,
  { ifNotExists, authorization } = {}
) => {
  const ifNotExistsStr = ifNotExists ? " IF NOT EXISTS" : "";
  const authorizationStr = authorization
    ? ` AUTHORIZATION ${authorization}`
    : "";
  return _utils.template`CREATE SCHEMA${ifNotExistsStr} "${schemaName}"${authorizationStr};`;
});

const renameSchema = (exports.renameSchema = (schemaName, newSchemaName) =>
  _utils.template`ALTER SCHEMA  "${schemaName}" RENAME TO "${newSchemaName}";`);

const undoRename = (schemaName, newSchemaName) =>
  renameSchema(newSchemaName, schemaName);

createSchema.reverse = dropSchema;
renameSchema.reverse = undoRename;
