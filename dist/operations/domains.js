"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameDomain = exports.alterDomain = exports.createDomain = exports.dropDomain = undefined;

var _utils = require("../utils");

const dropDomain = (exports.dropDomain = (
  domainName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP DOMAIN${ifExistsStr} "${domainName}"${cascadeStr};`;
});

const createDomain = (exports.createDomain = typeShorthands => {
  const _create = (domainName, type, options = {}) => {
    const defaultValue = options.default,
      collation = options.collation,
      notNull = options.notNull,
      check = options.check,
      constraintName = options.constraintName;

    const constraints = [];
    if (collation) {
      constraints.push(`COLLATE ${collation}`);
    }
    if (defaultValue !== undefined) {
      constraints.push(`DEFAULT ${(0, _utils.escapeValue)(defaultValue)}`);
    }
    if (notNull && check) {
      throw new Error('"notNull" and "check" can\'t be specified together');
    } else if (notNull || check) {
      if (constraintName) {
        constraints.push(`CONSTRAINT ${constraintName}`);
      }
      if (notNull) {
        constraints.push("NOT NULL");
      } else if (check) {
        constraints.push(`CHECK (${check})`);
      }
    }

    const constraintsStr = constraints.length
      ? ` ${constraints.join(" ")}`
      : "";

    const typeStr = (0, _utils.applyType)(type, typeShorthands).type;

    return _utils.template`CREATE DOMAIN "${domainName}" AS ${typeStr}${constraintsStr};`;
  };
  _create.reverse = (domainName, type, options) =>
    dropDomain(domainName, options);
  return _create;
});

const alterDomain = (exports.alterDomain = (domainName, options) => {
  const defaultValue = options.default,
    notNull = options.notNull,
    allowNull = options.allowNull,
    check = options.check,
    constraintName = options.constraintName;

  const actions = [];
  if (defaultValue === null) {
    actions.push("DROP DEFAULT");
  } else if (defaultValue !== undefined) {
    actions.push(`SET DEFAULT ${(0, _utils.escapeValue)(defaultValue)}`);
  }
  if (notNull) {
    actions.push("SET NOT NULL");
  } else if (notNull === false || allowNull) {
    actions.push("DROP NOT NULL");
  }
  if (check) {
    actions.push(
      `${constraintName ? `CONSTRAINT ${constraintName} ` : ""}CHECK (${check})`
    );
  }

  return `${actions
    .map(action => _utils.template`ALTER DOMAIN "${domainName}" ${action}`)
    .join(";\n")};`;
});

const renameDomain = (exports.renameDomain = (domainName, newDomainName) =>
  _utils.template`ALTER DOMAIN  "${domainName}" RENAME TO "${newDomainName}";`);

const undoRename = (domainName, newDomainName) =>
  renameDomain(newDomainName, domainName);

renameDomain.reverse = undoRename;
