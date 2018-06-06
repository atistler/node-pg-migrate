"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dropIndex = exports.createIndex = undefined;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("../utils");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function generateIndexName(table, columns, options) {
  return options.name
    ? options.name
    : ((tableName, cols, uniq) =>
        _utils.template`${tableName}_${cols}${uniq}_index`)(
        typeof table === "object" ? table.name : table,
        _lodash2.default.isArray(columns) ? columns.join("_") : columns,
        options.unique ? "_unique" : ""
      );
}

function generateColumnString(column) {
  const openingBracketPos = column.indexOf("(");
  const closingBracketPos = column.indexOf(")");
  const isFunction =
    openingBracketPos >= 0 && closingBracketPos > openingBracketPos;
  return isFunction
    ? column // expression
    : _utils.template`"${column}"`; // single column
}

function generateColumnsString(columns) {
  return _lodash2.default.isArray(columns)
    ? columns.map(generateColumnString).join(", ")
    : generateColumnString(columns);
}

const createIndex = (exports.createIndex = (
  tableName,
  columns,
  options = {}
) => {
  /*
   columns - the column, columns, or expression to create the index on
    Options
   name - explicitly specify the name for the index
   unique - is this a unique index
   where - where clause
   concurrently -
   opclass - name of an operator class 
   options.method -  [ btree | hash | gist | spgist | gin ]
   */
  const indexName = generateIndexName(tableName, columns, options);
  const columnsString = generateColumnsString(columns);
  const unique = options.unique ? " UNIQUE " : "";
  const concurrently = options.concurrently ? " CONCURRENTLY " : "";
  const method = options.method ? ` USING ${options.method}` : "";
  const where = options.where ? ` WHERE ${options.where}` : "";
  const opclass = options.opclass ? ` ${options.opclass}` : "";

  return _utils.template`CREATE ${unique} INDEX ${concurrently} "${indexName}" ON "${tableName}"${method} (${columnsString}${opclass})${where};`;
});

const dropIndex = (exports.dropIndex = (tableName, columns, options = {}) => {
  const concurrently = options.concurrently,
    ifExists = options.ifExists,
    cascade = options.cascade;

  const concurrentlyStr = concurrently ? " CONCURRENTLY" : "";
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const indexName = generateIndexName(tableName, columns, options);
  const cascadeStr = cascade ? " CASCADE" : "";

  return `DROP INDEX${concurrentlyStr}${ifExistsStr} "${indexName}"${cascadeStr};`;
});

// setup reverse functions
createIndex.reverse = dropIndex;
