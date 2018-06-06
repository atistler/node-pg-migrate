"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.undoRenameTypeAttribute = exports.renameTypeAttribute = exports.renameType = exports.addTypeValue = exports.setTypeAttribute = exports.addTypeAttribute = exports.dropTypeAttribute = exports.createType = exports.dropType = undefined;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("../utils");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const dropType = (exports.dropType = (typeName, { ifExists, cascade } = {}) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP TYPE${ifExistsStr} "${typeName}"${cascadeStr};`;
});

const createType = (exports.createType = typeShorthands => {
  const _create = (typeName, options) => {
    if (_lodash2.default.isArray(options)) {
      const optionsStr = options.map(_utils.escapeValue).join(", ");
      return _utils.template`CREATE TYPE "${typeName}" AS ENUM (${optionsStr});`;
    }
    const attributes = _lodash2.default
      .map(options, (attribute, attributeName) => {
        const typeStr = (0, _utils.applyType)(attribute, typeShorthands).type;
        return _utils.template`"${attributeName}" ${typeStr}`;
      })
      .join(",\n");
    return _utils.template`CREATE TYPE "${typeName}" AS (\n${attributes}\n);`;
  };
  _create.reverse = dropType;
  return _create;
});

const dropTypeAttribute = (exports.dropTypeAttribute = (
  typeName,
  attributeName,
  { ifExists } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  return _utils.template`ALTER TYPE "${typeName}" DROP ATTRIBUTE "${attributeName}"${ifExistsStr};`;
});

const addTypeAttribute = (exports.addTypeAttribute = typeShorthands => {
  const _alterAttributeAdd = (typeName, attributeName, attributeType) => {
    const typeStr = (0, _utils.applyType)(attributeType, typeShorthands).type;

    return _utils.template`ALTER TYPE "${typeName}" ADD ATTRIBUTE "${attributeName}" ${typeStr};`;
  };
  _alterAttributeAdd.reverse = dropTypeAttribute;
  return _alterAttributeAdd;
});

const setTypeAttribute = (exports.setTypeAttribute = typeShorthands => (
  typeName,
  attributeName,
  attributeType
) => {
  const typeStr = (0, _utils.applyType)(attributeType, typeShorthands).type;

  return _utils.template`ALTER TYPE "${typeName}" ALTER ATTRIBUTE "${attributeName}" SET DATA TYPE ${typeStr};`;
});
const addTypeValue = (exports.addTypeValue = (
  typeName,
  value,
  options = {}
) => {
  const ifNotExists = options.ifNotExists,
    before = options.before,
    after = options.after;

  if (before && after) {
    throw new Error('"before" and "after" can\'t be specified together');
  }
  const beforeStr = before ? ` BEFORE ${before}` : "";
  const afterStr = after ? ` AFTER ${after}` : "";
  const ifNotExistsStr = ifNotExists ? " IF NOT EXISTS" : "";
  const valueStr = (0, _utils.escapeValue)(value);

  return _utils.template`ALTER TYPE "${typeName}" ADD VALUE${ifNotExistsStr} ${valueStr}${beforeStr}${afterStr};`;
});

const renameType = (exports.renameType = (typeName, newTypeName) =>
  _utils.template`ALTER TYPE  "${typeName}" RENAME TO "${newTypeName}";`);

const undoRename = (typeName, newTypeName) => renameType(newTypeName, typeName);

const renameTypeAttribute = (exports.renameTypeAttribute = (
  typeName,
  attributeName,
  newAttributeName
) =>
  _utils.template`ALTER TYPE "${typeName}" RENAME ATTRIBUTE "${attributeName}" TO "${newAttributeName}";`);

const undoRenameTypeAttribute = (exports.undoRenameTypeAttribute = (
  typeName,
  attributeName,
  newAttributeName
) => renameTypeAttribute(typeName, newAttributeName, attributeName));

renameType.reverse = undoRename;
renameTypeAttribute.reverse = undoRenameTypeAttribute;
