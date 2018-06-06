"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameView = exports.alterViewColumn = exports.alterView = exports.createView = exports.dropView = undefined;

var _utils = require("../utils");

const dropView = (exports.dropView = (viewName, { ifExists, cascade } = {}) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP VIEW${ifExistsStr} "${viewName}"${cascadeStr};`;
});

const createView = (exports.createView = (viewName, options, definition) => {
  const temporary = options.temporary,
    replace = options.replace,
    recursive = options.recursive;
  var _options$columns = options.columns;
  const columns = _options$columns === undefined ? [] : _options$columns,
    checkOption = options.checkOption;
  // prettier-ignore

  const columnNames = (0, _utils.quote)(Array.isArray(columns) ? columns : [columns]).join(", ");
  const replaceStr = replace ? " OR REPLACE" : "";
  const temporaryStr = temporary ? " TEMPORARY" : "";
  const recursiveStr = recursive ? " RECURSIVE" : "";
  const columnStr = columnNames ? `(${columnNames})` : "";
  const checkOptionStr = checkOption ? ` WITH ${checkOption} CHECK OPTION` : "";

  return _utils.template`CREATE${replaceStr}${temporaryStr}${recursiveStr} VIEW "${viewName}"${columnStr} AS ${definition}${checkOptionStr};`;
});

const alterView = (exports.alterView = (viewName, options) => {
  const checkOption = options.checkOption;

  const clauses = [];
  if (checkOption !== undefined) {
    if (checkOption) {
      clauses.push(`SET check_option = ${checkOption}`);
    } else {
      clauses.push(`RESET check_option`);
    }
  }
  return clauses
    .map(clause => _utils.template`ALTER VIEW "${viewName}" ${clause};`)
    .join("\n");
});

const alterViewColumn = (exports.alterViewColumn = (
  viewName,
  columnName,
  options
) => {
  const defaultValue = options.default;

  const actions = [];
  if (defaultValue === null) {
    actions.push("DROP DEFAULT");
  } else if (defaultValue !== undefined) {
    actions.push(`SET DEFAULT ${(0, _utils.escapeValue)(defaultValue)}`);
  }
  return actions
    .map(
      action =>
        _utils.template`ALTER VIEW "${viewName}" ALTER COLUMN ${columnName} ${action};`
    )
    .join("\n");
});

const renameView = (exports.renameView = (viewName, newViewName) =>
  _utils.template`ALTER VIEW "${viewName}" RENAME TO "${newViewName}";`);

const undoRename = (viewName, newViewName) => renameView(newViewName, viewName);

createView.reverse = dropView;
renameView.reverse = undoRename;
