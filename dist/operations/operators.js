"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameOperatorClass = exports.createOperatorClass = exports.dropOperatorClass = exports.renameOperatorFamily = exports.addToOperatorFamily = exports.removeFromOperatorFamily = exports.changeOperatorFamily = exports.dropOperatorFamily = exports.createOperatorFamily = exports.dropOperator = exports.createOperator = undefined;

var _utils = require("../utils");

const createOperator = (exports.createOperator = (
  operatorName,
  options = {}
) => {
  const procedure = options.procedure,
    left = options.left,
    right = options.right,
    commutator = options.commutator,
    negator = options.negator,
    restrict = options.restrict,
    join = options.join,
    hashes = options.hashes,
    merges = options.merges;

  const defs = [];
  defs.push(`PROCEDURE = ${(0, _utils.schemalize)(procedure)}`);
  if (left) {
    defs.push(`LEFTARG = ${(0, _utils.schemalize)(left)}`);
  }
  if (right) {
    defs.push(`RIGHTARG = ${(0, _utils.schemalize)(right)}`);
  }
  if (commutator) {
    defs.push(`COMMUTATOR = ${(0, _utils.opSchemalize)(commutator)}`);
  }
  if (negator) {
    defs.push(`NEGATOR = ${(0, _utils.opSchemalize)(negator)}`);
  }
  if (restrict) {
    defs.push(`RESTRICT = ${(0, _utils.schemalize)(restrict)}`);
  }
  if (join) {
    defs.push(`JOIN = ${(0, _utils.schemalize)(join)}`);
  }
  if (hashes) {
    defs.push("HASHES");
  }
  if (merges) {
    defs.push("MERGES");
  }
  return `CREATE OPERATOR ${(0, _utils.opSchemalize)(
    operatorName
  )} (${defs.join(", ")});`;
});

const dropOperator = (exports.dropOperator = (operatorName, options = {}) => {
  const ifExists = options.ifExists,
    cascade = options.cascade,
    left = options.left,
    right = options.right;

  const operatorNameStr = (0, _utils.schemalize)(operatorName);
  const leftStr = (0, _utils.schemalize)(left || "none");
  const rightStr = (0, _utils.schemalize)(right || "none");

  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";

  return `DROP OPERATOR${ifExistsStr} ${operatorNameStr}(${leftStr}, ${rightStr})${cascadeStr};`;
});

const createOperatorFamily = (exports.createOperatorFamily = (
  operatorFamilyName,
  indexMethod
) => {
  const operatorFamilyNameStr = (0, _utils.schemalize)(operatorFamilyName);
  return `CREATE OPERATOR FAMILY ${operatorFamilyNameStr} USING ${indexMethod};`;
});

const dropOperatorFamily = (exports.dropOperatorFamily = (
  operatorFamilyName,
  indexMethod,
  { ifExists, cascade } = {}
) => {
  const operatorFamilyNameStr = (0, _utils.schemalize)(operatorFamilyName);
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return `DROP OPERATOR FAMILY ${ifExistsStr} ${operatorFamilyNameStr} USING ${indexMethod}${cascadeStr};`;
});

const operatorMap = typeShorthands => ({
  type = "",
  number,
  name,
  params = []
}) => {
  if (String(type).toLowerCase() === "function") {
    if (params.length > 2) {
      throw new Error("Operator can't have more than 2 parameters");
    }
    const nameStr = (0, _utils.schemalize)(name);
    const paramsStr =
      params.length > 0 ? (0, _utils.formatParams)(params, typeShorthands) : "";

    return `OPERATOR ${number} ${nameStr}${paramsStr}`;
  } else if (String(type).toLowerCase() === "operator") {
    const paramsStr = (0, _utils.formatParams)(params, typeShorthands);
    return `FUNCTION ${number} ${(0, _utils.schemalize)(name)}${paramsStr}`;
  }
  throw new Error('Operator "type" must be either "function" or "operator"');
};

const changeOperatorFamily = (exports.changeOperatorFamily = (
  op,
  reverse
) => typeShorthands => {
  const method = (operatorFamilyName, indexMethod, operatorList) => {
    const operatorFamilyNameStr = (0, _utils.schemalize)(operatorFamilyName);
    const operatorListStr = operatorList
      .map(operatorMap(typeShorthands))
      .join(",\n  ");

    return `ALTER OPERATOR FAMILY ${operatorFamilyNameStr} USING ${indexMethod} ${op}
  ${operatorListStr};`;
  };
  if (reverse) {
    method.reverse = reverse(typeShorthands);
  }
  return method;
});

const removeFromOperatorFamily = (exports.removeFromOperatorFamily = changeOperatorFamily(
  "DROP"
));
const addToOperatorFamily = (exports.addToOperatorFamily = changeOperatorFamily(
  "ADD",
  removeFromOperatorFamily
));

const renameOperatorFamily = (exports.renameOperatorFamily = (
  oldOperatorFamilyName,
  indexMethod,
  newOperatorFamilyName
) => {
  const oldOperatorFamilyNameStr = (0, _utils.schemalize)(
    oldOperatorFamilyName
  );
  const newOperatorFamilyNameStr = (0, _utils.schemalize)(
    newOperatorFamilyName
  );

  return `ALTER OPERATOR FAMILY ${oldOperatorFamilyNameStr} USING ${indexMethod} RENAME TO ${newOperatorFamilyNameStr};`;
});

const undoRenameOperatorFamily = (
  oldOperatorFamilyName,
  indexMethod,
  newOperatorFamilyName
) =>
  renameOperatorFamily(
    newOperatorFamilyName,
    indexMethod,
    oldOperatorFamilyName
  );

const dropOperatorClass = (exports.dropOperatorClass = (
  operatorClassName,
  indexMethod,
  { ifExists, cascade } = {}
) => {
  const operatorClassNameStr = (0, _utils.schemalize)(operatorClassName);
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";

  return `DROP OPERATOR CLASS ${ifExistsStr} ${operatorClassNameStr} USING ${indexMethod}${cascadeStr};`;
});

const createOperatorClass = (exports.createOperatorClass = typeShorthands => {
  const _create = (
    operatorClassName,
    type,
    indexMethod,
    operatorList,
    options
  ) => {
    const isDefault = options.default,
      family = options.family;

    const operatorClassNameStr = (0, _utils.schemalize)(operatorClassName);
    const defaultStr = isDefault ? " DEFAULT" : "";
    const typeStr = (0, _utils.schemalize)((0, _utils.applyType)(type).type);
    const indexMethodStr = (0, _utils.schemalize)(indexMethod);
    const familyStr = family ? ` FAMILY ${family}` : "";
    const operatorListStr = operatorList
      .map(operatorMap(typeShorthands))
      .join(",\n  ");

    return `CREATE OPERATOR CLASS ${operatorClassNameStr}${defaultStr} FOR TYPE ${typeStr} USING ${indexMethodStr} ${familyStr} AS
  ${operatorListStr};`;
  };
  _create.reverse = (
    operatorClassName,
    type,
    indexMethod,
    operatorList,
    options
  ) => dropOperatorClass(operatorClassName, indexMethod, options);
  return _create;
});

const renameOperatorClass = (exports.renameOperatorClass = (
  oldOperatorClassName,
  indexMethod,
  newOperatorClassName
) => {
  const oldOperatorClassNameStr = (0, _utils.schemalize)(oldOperatorClassName);
  const newOperatorClassNameStr = (0, _utils.schemalize)(newOperatorClassName);

  return `ALTER OPERATOR CLASS ${oldOperatorClassNameStr} USING ${indexMethod} RENAME TO ${newOperatorClassNameStr};`;
});

const undoRenameOperatorClass = (
  oldOperatorClassName,
  indexMethod,
  newOperatorClassName
) =>
  renameOperatorClass(newOperatorClassName, indexMethod, oldOperatorClassName);

// setup reverse functions
createOperator.reverse = dropOperator;
createOperatorFamily.reverse = dropOperatorFamily;
renameOperatorFamily.reverse = undoRenameOperatorFamily;
renameOperatorClass.reverse = undoRenameOperatorClass;
