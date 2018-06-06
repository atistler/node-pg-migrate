"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameTrigger = exports.createTrigger = exports.dropTrigger = undefined;

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _lodash = require("lodash");

var _utils = require("../utils");

var _functions = require("./functions");

const dropTrigger = (exports.dropTrigger = (
  tableName,
  triggerName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP TRIGGER${ifExistsStr} "${triggerName}" ON "${tableName}"${cascadeStr};`;
});
const createTrigger = (exports.createTrigger = typeShorthands => {
  const _create = (tableName, triggerName, triggerOptions = {}, definition) => {
    const constraint = triggerOptions.constraint,
      condition = triggerOptions.condition,
      operation = triggerOptions.operation,
      deferrable = triggerOptions.deferrable,
      deferred = triggerOptions.deferred;
    var _triggerOptions$funct = triggerOptions.functionArgs;
    const functionArgs =
      _triggerOptions$funct === undefined ? [] : _triggerOptions$funct;
    let when = triggerOptions.when;
    var _triggerOptions$level = triggerOptions.level;
    let level =
        _triggerOptions$level === undefined
          ? "STATEMENT"
          : _triggerOptions$level,
      functionName = triggerOptions.function;

    const operations = (0, _lodash.isArray)(operation)
      ? operation.join(" OR ")
      : operation;
    if (constraint) {
      when = "AFTER";
    }
    const isInsteadOf = /instead\s+of/i.test(when);
    if (isInsteadOf) {
      level = "ROW";
    }
    if (definition) {
      functionName = functionName || triggerName;
    }

    if (!when) {
      throw new Error('"when" (BEFORE/AFTER/INSTEAD OF) have to be specified');
    } else if (isInsteadOf && condition) {
      throw new Error("INSTEAD OF trigger can't have condition specified");
    }
    if (!operations) {
      throw new Error(
        '"operation" (INSERT/UPDATE[ OF ...]/DELETE/TRUNCATE) have to be specified'
      );
    }

    const defferStr = constraint
      ? `${
          deferrable
            ? `DEFERRABLE INITIALLY ${deferred ? "DEFERRED" : "IMMEDIATE"}`
            : "NOT DEFERRABLE"
        }\n  `
      : "";
    const conditionClause = condition ? `WHEN (${condition})\n  ` : "";
    const constraintStr = constraint ? " CONSTRAINT" : "";
    const paramsStr = functionArgs.map(_utils.escapeValue).join(", ");

    const triggerSQL = _utils.template`CREATE${constraintStr} TRIGGER "${triggerName}"
  ${when} ${operations} ON "${tableName}"
  ${defferStr}FOR EACH ${level}
  ${conditionClause}EXECUTE PROCEDURE "${functionName}"(${paramsStr});`;

    const fnSQL = definition
      ? `${(0, _functions.createFunction)(typeShorthands)(
          functionName,
          [],
          _extends({}, triggerOptions, { returns: "trigger" }),
          definition
        )}\n`
      : "";
    return `${fnSQL}${triggerSQL}`;
  };

  _create.reverse = (
    tableName,
    triggerName,
    triggerOptions = {},
    definition
  ) => {
    const triggerSQL = dropTrigger(tableName, triggerName, triggerOptions);
    const fnSQL = definition
      ? `\n${(0, _functions.dropFunction)(typeShorthands)(
          triggerOptions.function || triggerName,
          [],
          triggerOptions
        )}`
      : "";
    return `${triggerSQL}${fnSQL}`;
  };

  return _create;
});

const renameTrigger = (exports.renameTrigger = (
  tableName,
  oldTriggerName,
  newTriggerName
) =>
  _utils.template`ALTER TRIGGER "${oldTriggerName}" ON "${tableName}" RENAME TO "${newTriggerName}";`);

const undoRename = (tableName, oldTriggerName, newTriggerName) =>
  renameTrigger(tableName, newTriggerName, oldTriggerName);

renameTrigger.reverse = undoRename;
