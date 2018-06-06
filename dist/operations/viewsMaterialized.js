"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refreshMaterializedView = exports.renameMaterializedViewColumn = exports.renameMaterializedView = exports.alterMaterializedView = exports.createMaterializedView = exports.dropMaterializedView = undefined;

var _utils = require("../utils");

const dataClause = data =>
  data !== undefined ? ` WITH${data ? "" : " NO"} DATA` : "";
const storageParameterStr = storageParameters => key => {
  const value =
    storageParameters[key] === true ? "" : ` = ${storageParameters[key]}`;
  return `${key}${value}`;
};

const dropMaterializedView = (exports.dropMaterializedView = (
  viewName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP MATERIALIZED VIEW${ifExistsStr} "${viewName}"${cascadeStr};`;
});

const createMaterializedView = (exports.createMaterializedView = (
  viewName,
  options,
  definition
) => {
  const ifNotExists = options.ifNotExists;
  var _options$columns = options.columns;
  const columns = _options$columns === undefined ? [] : _options$columns,
    tablespace = options.tablespace;
  var _options$storageParam = options.storageParameters;
  const storageParameters =
      _options$storageParam === undefined ? {} : _options$storageParam,
    data = options.data;
  // prettier-ignore

  const columnNames = (0, _utils.quote)(Array.isArray(columns) ? columns : [columns]).join(", ");
  const withOptions = Object.keys(storageParameters)
    .map(storageParameterStr(storageParameters))
    .join(", ");

  const ifNotExistsStr = ifNotExists ? " IF NOT EXISTS" : "";
  const columnsStr = columnNames ? `(${columnNames})` : "";
  const withOptionsStr = withOptions ? ` WITH (${withOptions})` : "";
  const tablespaceStr = tablespace ? `TABLESPACE ${tablespace}` : "";
  const dataStr = dataClause(data);

  return _utils.template`CREATE MATERIALIZED VIEW${ifNotExistsStr} "${viewName}"${columnsStr}${withOptionsStr}${tablespaceStr} AS ${definition}${dataStr};`;
});

const alterMaterializedView = (exports.alterMaterializedView = (
  viewName,
  options
) => {
  const cluster = options.cluster,
    extension = options.extension;
  var _options$storageParam2 = options.storageParameters;
  const storageParameters =
    _options$storageParam2 === undefined ? {} : _options$storageParam2;

  const clauses = [];
  if (cluster !== undefined) {
    if (cluster) {
      clauses.push(`CLUSTER ON "${cluster}"`);
    } else {
      clauses.push(`SET WITHOUT CLUSTER`);
    }
  }
  if (extension) {
    clauses.push(`DEPENDS ON EXTENSION "${extension}"`);
  }
  const withOptions = Object.keys(storageParameters)
    .filter(key => storageParameters[key])
    .map(storageParameterStr(storageParameters))
    .join(", ");
  if (withOptions) {
    clauses.push(`SET (${withOptions})`);
  }
  const resetOptions = Object.keys(storageParameters)
    .filter(key => !storageParameters[key])
    .join(", ");
  if (resetOptions) {
    clauses.push(`RESET (${resetOptions})`);
  }
  const clausesStr = (0, _utils.formatLines)(clauses);
  return _utils.template`ALTER MATERIALIZED VIEW "${viewName}"\n${clausesStr};`;
});

const renameMaterializedView = (exports.renameMaterializedView = (
  viewName,
  newViewName
) =>
  _utils.template`ALTER MATERIALIZED VIEW "${viewName}" RENAME TO "${newViewName}";`);

const undoRename = (viewName, newViewName) =>
  renameMaterializedView(newViewName, viewName);

const renameMaterializedViewColumn = (exports.renameMaterializedViewColumn = (
  viewName,
  columnName,
  newColumnName
) =>
  _utils.template`ALTER MATERIALIZED VIEW "${viewName}" RENAME COLUMN ${columnName} TO "${newColumnName}";`);

const undoRenameColumn = (viewName, columnName, newColumnName) =>
  renameMaterializedViewColumn(viewName, newColumnName, columnName);

const refreshMaterializedView = (exports.refreshMaterializedView = (
  viewName,
  { concurrently, data } = {}
) => {
  const concurrentlyStr = concurrently ? " CONCURRENTLY" : "";
  const dataStr = dataClause(data);
  return _utils.template`REFRESH MATERIALIZED VIEW${concurrentlyStr} "${viewName}"${dataStr};`;
});

createMaterializedView.reverse = dropMaterializedView;
renameMaterializedView.reverse = undoRename;
renameMaterializedViewColumn.reverse = undoRenameColumn;
refreshMaterializedView.reverse = refreshMaterializedView;
