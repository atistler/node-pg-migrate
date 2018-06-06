"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

// This is used to create unescaped strings
// exposed in the migrations via pgm.func
class PgLiteral {
  static create(str) {
    return new PgLiteral(str);
  }

  constructor(str) {
    this._str = str;
  }

  toString() {
    return this._str;
  }
}

exports.PgLiteral = PgLiteral;
const schemalize = (exports.schemalize = v => {
  if (typeof v === "object") {
    const schema = v.schema,
      name = v.name;

    return (schema ? `${schema}"."` : "") + name;
  }
  return v;
});

const opSchemalize = (exports.opSchemalize = v => {
  if (typeof v === "object") {
    const schema = v.schema,
      name = v.name;

    return schema ? `OPERATOR(${schema}.${name})` : name;
  }
  return v;
});

const t = (exports.t = (s, d) =>
  Object.keys(d || {}).reduce(
    (str, p) => str.replace(new RegExp(`{${p}}`, "g"), schemalize(d[p])), // eslint-disable-line security/detect-non-literal-regexp
    s
  ));

const escapeValue = (exports.escapeValue = val => {
  if (val === null) {
    return "NULL";
  }
  if (typeof val === "boolean") {
    return val.toString();
  }
  if (typeof val === "string") {
    let dollars;
    let index = 0;
    do {
      index += 1;
      dollars = `$pg${index}$`;
    } while (val.indexOf(dollars) >= 0);
    return `${dollars}${val}${dollars}`;
  }
  if (typeof val === "number") {
    return val;
  }
  if (Array.isArray(val)) {
    const arrayStr = val
      .map(escapeValue)
      .join(",")
      .replace(/ARRAY/g, "");
    return `ARRAY[${arrayStr}]`;
  }
  if (val instanceof PgLiteral) {
    return val.toString();
  }
  return "";
});

const template = (exports.template = (strings, ...keys) => {
  const result = [strings[0]];
  keys.forEach((key, i) => {
    result.push(schemalize(key), strings[i + 1]);
  });
  return result.join("");
});

const opTemplate = (exports.opTemplate = (strings, ...keys) => {
  const result = [strings[0]];
  keys.forEach((key, i) => {
    result.push(opSchemalize(key), strings[i + 1]);
  });
  return result.join("");
});

const getMigrationTableSchema = (exports.getMigrationTableSchema = options =>
  options.migrationsSchema !== undefined // eslint-disable-line no-nested-ternary
    ? options.migrationsSchema
    : options.schema !== undefined
      ? options.schema
      : "public");

const finallyPromise = (exports.finallyPromise = func => [
  func,
  err => {
    const errHandler = innerErr => {
      console.error(innerErr.stack ? innerErr.stack : innerErr);
      throw err;
    };
    try {
      return Promise.resolve(func()).then(() => {
        throw err;
      }, errHandler);
    } catch (innerErr) {
      return errHandler(innerErr);
    }
  }
]);

const quote = (exports.quote = array => array.map(item => template`"${item}"`));

const typeAdapters = {
  int: "integer",
  string: "text",
  float: "real",
  double: "double precision",
  datetime: "timestamp",
  bool: "boolean"
};

const defaultTypeShorthands = {
  id: {
    type: "serial",
    primaryKey: true // convenience type for serial primary keys
  }
};

// some convenience adapters -- see above
const applyTypeAdapters = (exports.applyTypeAdapters = type =>
  typeAdapters[type] ? typeAdapters[type] : type);

const applyType = (exports.applyType = (type, extendingTypeShorthands = {}) => {
  const typeShorthands = _extends(
    {},
    defaultTypeShorthands,
    extendingTypeShorthands
  );
  const options = typeof type === "string" ? { type } : type;
  const ext = typeShorthands[options.type] || { type: options.type };
  return _extends({}, ext, options, {
    type: applyTypeAdapters(ext.type)
  });
});

const formatParam = typeShorthands => param => {
  var _applyType = applyType(param, typeShorthands);

  const mode = _applyType.mode,
    name = _applyType.name,
    type = _applyType.type,
    defaultValue = _applyType.default;

  const options = [];
  if (mode) {
    options.push(mode);
  }
  if (name) {
    options.push(schemalize(name));
  }
  if (type) {
    options.push(type);
  }
  if (defaultValue) {
    options.push(`DEFAULT ${escapeValue(defaultValue)}`);
  }
  return options.join(" ");
};

const formatParams = (exports.formatParams = (params = [], typeShorthands) =>
  `(${params.map(formatParam(typeShorthands)).join(", ")})`);

const comment = (exports.comment = (object, name, text) => {
  const cmt = escapeValue(text || null);
  return template`COMMENT ON ${object} "${name}" IS ${cmt};`;
});

const formatLines = (exports.formatLines = (
  lines,
  replace = "  ",
  separator = ","
) =>
  lines
    .map(line => line.replace(/(?:\r\n|\r|\n)+/g, " "))
    .join(`${separator}\n`)
    .replace(/^/gm, replace));
