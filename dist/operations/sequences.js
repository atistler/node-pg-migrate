"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameSequence = exports.alterSequence = exports.createSequence = exports.dropSequence = undefined;

var _utils = require("../utils");

const parseOptions = (typeShorthands, options) => {
  const type = options.type,
    increment = options.increment,
    minvalue = options.minvalue,
    maxvalue = options.maxvalue,
    start = options.start,
    cache = options.cache,
    cycle = options.cycle,
    owner = options.owner;

  const clauses = [];
  if (type) {
    clauses.push(`AS ${(0, _utils.applyType)(type, typeShorthands).type}`);
  }
  if (increment) {
    clauses.push(`INCREMENT BY ${increment}`);
  }
  if (minvalue) {
    clauses.push(`MINVALUE ${minvalue}`);
  } else if (minvalue === null || minvalue === false) {
    clauses.push("NO MINVALUE");
  }
  if (maxvalue) {
    clauses.push(`MAXVALUE ${maxvalue}`);
  } else if (maxvalue === null || maxvalue === false) {
    clauses.push("NO MAXVALUE");
  }
  if (start) {
    clauses.push(`START WITH ${start}`);
  }
  if (cache) {
    clauses.push(`CACHE ${cache}`);
  }
  if (cycle) {
    clauses.push("CYCLE");
  } else if (cycle === false) {
    clauses.push("NO CYCLE");
  }
  if (owner) {
    clauses.push(`OWNED BY ${owner}`);
  } else if (owner === null || owner === false) {
    clauses.push("OWNED BY NONE");
  }
  return clauses;
};

const dropSequence = (exports.dropSequence = (
  sequenceName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP SEQUENCE${ifExistsStr} "${sequenceName}"${cascadeStr};`;
});

const createSequence = (exports.createSequence = typeShorthands => {
  const _create = (sequenceName, options = {}) => {
    const temporary = options.temporary,
      ifNotExists = options.ifNotExists;

    const temporaryStr = temporary ? " TEMPORARY" : "";
    const ifNotExistsStr = ifNotExists ? " IF NOT EXISTS" : "";
    const clausesStr = parseOptions(typeShorthands, options).join("\n  ");
    return _utils.template`CREATE${temporaryStr} SEQUENCE${ifNotExistsStr} "${sequenceName}"
  ${clausesStr};`;
  };
  _create.reverse = dropSequence;
  return _create;
});

const alterSequence = (exports.alterSequence = typeShorthands => (
  sequenceName,
  options
) => {
  const restart = options.restart;

  const clauses = parseOptions(typeShorthands, options);
  if (restart) {
    if (restart === true) {
      clauses.push("RESTART");
    } else {
      clauses.push(`RESTART WITH ${restart}`);
    }
  }
  return _utils.template`ALTER SEQUENCE "${sequenceName}"
  ${clauses.join("\n  ")};`;
});

const renameSequence = (exports.renameSequence = (
  sequenceName,
  newSequenceName
) =>
  _utils.template`ALTER SEQUENCE "${sequenceName}" RENAME TO "${newSequenceName}";`);

const undoRename = (sequenceName, newSequenceName) =>
  renameSequence(newSequenceName, sequenceName);

renameSequence.reverse = undoRename;
