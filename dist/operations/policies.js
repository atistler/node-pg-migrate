"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renamePolicy = exports.dropPolicy = exports.alterPolicy = exports.createPolicy = undefined;

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

var _utils = require("../utils");

const makeClauses = ({ role, using, check }) => {
  const roles = (Array.isArray(role) ? role : [role]).join(", ");
  const clauses = [];
  if (roles) {
    clauses.push(`TO ${roles}`);
  }
  if (using) {
    clauses.push(`USING (${using})`);
  }
  if (check) {
    clauses.push(`WITH CHECK (${check})`);
  }
  return clauses;
};

const createPolicy = (exports.createPolicy = (
  tableName,
  policyName,
  options = {}
) => {
  const createOptions = _extends({}, options, {
    role: options.role || "PUBLIC"
  });
  const clauses = [
    `FOR ${options.command || "ALL"}`,
    ...makeClauses(createOptions)
  ];
  const clausesStr = clauses.join(" ");
  return _utils.template`CREATE POLICY "${policyName}" ON "${tableName}" ${clausesStr};`;
});

const alterPolicy = (exports.alterPolicy = (
  tableName,
  policyName,
  options = {}
) => {
  const clausesStr = makeClauses(options).join(" ");
  return _utils.template`ALTER POLICY "${policyName}" ON "${tableName}" ${clausesStr};`;
});

const dropPolicy = (exports.dropPolicy = (
  tableName,
  policyName,
  { ifExists } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  return _utils.template`DROP POLICY${ifExistsStr} "${policyName}" ON "${tableName}";`;
});

const renamePolicy = (exports.renamePolicy = (
  tableName,
  policyName,
  newPolicyName
) =>
  _utils.template`ALTER POLICY  "${policyName}" ON "${tableName}" RENAME TO "${newPolicyName}";`);

const undoRename = (tableName, policyName, newPolicyName) =>
  renamePolicy(tableName, newPolicyName, policyName);

// setup reverse functions
createPolicy.reverse = dropPolicy;
renamePolicy.reverse = undoRename;
