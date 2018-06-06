"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renameFunction = exports.createFunction = exports.dropFunction = undefined;

var _utils = require("../utils");

const dropFunction = (exports.dropFunction = typeShorthands => (
  functionName,
  functionParams = [],
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  const paramsStr = (0, _utils.formatParams)(functionParams, typeShorthands);
  return _utils.template`DROP FUNCTION${ifExistsStr} "${functionName}"${paramsStr}${cascadeStr};`;
});

const createFunction = (exports.createFunction = typeShorthands => {
  const _create = (
    functionName,
    functionParams = [],
    functionOptions = {},
    definition
  ) => {
    const replace = functionOptions.replace;
    var _functionOptions$retu = functionOptions.returns;
    const returns =
        _functionOptions$retu === undefined ? "void" : _functionOptions$retu,
      language = functionOptions.language,
      window = functionOptions.window;
    var _functionOptions$beha = functionOptions.behavior;
    const behavior =
        _functionOptions$beha === undefined
          ? "VOLATILE"
          : _functionOptions$beha,
      onNull = functionOptions.onNull;
    var _functionOptions$para = functionOptions.parallel;
    const parallel =
      _functionOptions$para === undefined ? "UNSAFE" : _functionOptions$para;

    const options = [];
    if (behavior) {
      options.push(behavior);
    }
    if (language) {
      options.push(`LANGUAGE ${language}`);
    } else {
      throw new Error(
        `Language for function ${functionName} have to be specified`
      );
    }
    if (window) {
      options.push("WINDOW");
    }
    if (onNull) {
      options.push("RETURNS NULL ON NULL INPUT");
    }
    if (parallel) {
      options.push(`PARALLEL ${parallel}`);
    }

    const replaceStr = replace ? " OR REPLACE" : "";
    const paramsStr = (0, _utils.formatParams)(functionParams, typeShorthands);

    return _utils.template`CREATE${replaceStr} FUNCTION "${functionName}"${paramsStr}
  RETURNS ${returns}
  AS ${(0, _utils.escapeValue)(definition)}
  ${options.join("\n  ")};`;
  };

  _create.reverse = dropFunction(typeShorthands);

  return _create;
});

const renameFunction = (exports.renameFunction = typeShorthands => {
  const _rename = (oldFunctionName, functionParams = [], newFunctionName) => {
    const paramsStr = (0, _utils.formatParams)(functionParams, typeShorthands);
    return _utils.template`ALTER FUNCTION "${oldFunctionName}"${paramsStr} RENAME TO "${newFunctionName}";`;
  };

  _rename.reverse = (oldFunctionName, functionParams, newFunctionName) =>
    _rename(newFunctionName, functionParams, oldFunctionName);

  return _rename;
});
