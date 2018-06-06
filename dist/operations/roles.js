"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameRole = exports.alterRole = exports.dropRole = exports.createRole = undefined;

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

const formatRoleOptions = (roleOptions = {}) => {
  const options = [];
  if (roleOptions.superuser !== undefined) {
    options.push(roleOptions.superuser ? "SUPERUSER" : "NOSUPERUSER");
  }
  if (roleOptions.createdb !== undefined) {
    options.push(roleOptions.createdb ? "CREATEDB" : "NOCREATEDB");
  }
  if (roleOptions.createrole !== undefined) {
    options.push(roleOptions.createrole ? "CREATEROLE" : "NOCREATEROLE");
  }
  if (roleOptions.inherit !== undefined) {
    options.push(roleOptions.inherit ? "INHERIT" : "NOINHERIT");
  }
  if (roleOptions.login !== undefined) {
    options.push(roleOptions.login ? "LOGIN" : "NOLOGIN");
  }
  if (roleOptions.replication !== undefined) {
    options.push(roleOptions.replication ? "REPLICATION" : "NOREPLICATION");
  }
  if (roleOptions.bypassrls !== undefined) {
    options.push(roleOptions.bypassrls ? "BYPASSRLS" : "NOBYPASSRLS");
  }
  if (roleOptions.limit) {
    options.push(`CONNECTION LIMIT ${Number(roleOptions.limit)}`);
  }
  if (roleOptions.password !== undefined) {
    const encrypted =
      roleOptions.encrypted === false ? "UNENCRYPTED" : "ENCRYPTED";
    options.push(
      `${encrypted} PASSWORD ${(0, _utils.escapeValue)(roleOptions.password)}`
    );
  }
  if (roleOptions.valid !== undefined) {
    const valid = roleOptions.valid
      ? (0, _utils.escapeValue)(roleOptions.valid)
      : "'infinity'";
    options.push(`VALID UNTIL ${valid}`);
  }
  if (roleOptions.inRole) {
    const inRole = (0, _lodash.isArray)(roleOptions.inRole)
      ? roleOptions.inRole.join(",")
      : roleOptions.inRole;
    options.push(`IN ROLE ${inRole}`);
  }
  if (roleOptions.role) {
    const role = (0, _lodash.isArray)(roleOptions.role)
      ? roleOptions.role.join(",")
      : roleOptions.role;
    options.push(`ROLE ${role}`);
  }
  if (roleOptions.admin) {
    const admin = (0, _lodash.isArray)(roleOptions.admin)
      ? roleOptions.admin.join(",")
      : roleOptions.admin;
    options.push(`ADMIN ${admin}`);
  }

  return options.join(" ");
};

const createRole = (exports.createRole = (roleName, roleOptions = {}) => {
  const options = formatRoleOptions(
    _extends({}, roleOptions, {
      superuser: roleOptions.superuser || false,
      createdb: roleOptions.createdb || false,
      createrole: roleOptions.createrole || false,
      inherit: roleOptions.inherit !== false,
      login: roleOptions.login || false,
      replication: roleOptions.replication || false
    })
  );
  const optionsStr = options ? ` WITH ${options}` : "";
  return _utils.template`CREATE ROLE "${roleName}"${optionsStr};`;
});

const dropRole = (exports.dropRole = (roleName, { ifExists } = {}) =>
  _utils.template`DROP ROLE${ifExists ? " IF EXISTS" : ""} "${roleName}";`);

const alterRole = (exports.alterRole = (roleName, roleOptions = {}) => {
  const options = formatRoleOptions(roleOptions);
  return options
    ? _utils.template`ALTER ROLE "${roleName}" WITH ${options};`
    : "";
});

const renameRole = (exports.renameRole = (oldRoleName, newRoleName) =>
  _utils.template`ALTER ROLE "${oldRoleName}" RENAME TO "${newRoleName}";`);

const undoRename = (oldRoleName, newRoleName) =>
  renameRole(newRoleName, oldRoleName);

// setup reverse functions
createRole.reverse = dropRole;
renameRole.reverse = undoRename;
