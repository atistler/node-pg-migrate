"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dropConstraint = exports.addConstraint = exports.renameConstraint = exports.renameColumn = exports.renameTable = exports.alterColumn = exports.addColumns = exports.dropColumns = exports.alterTable = exports.createTable = exports.dropTable = undefined;

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

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("../utils");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const parseReferences = options => {
  const references = options.references,
    match = options.match,
    onDelete = options.onDelete,
    onUpdate = options.onUpdate;

  const clauses = [
    typeof references === "string"
      ? `REFERENCES ${references}`
      : _utils.template`REFERENCES "${references}"`
  ];
  if (match) {
    clauses.push(`MATCH ${match}`);
  }
  if (onDelete) {
    clauses.push(`ON DELETE ${onDelete}`);
  }
  if (onUpdate) {
    clauses.push(`ON UPDATE ${onUpdate}`);
  }
  return clauses.join(" ");
};

const parseDeferrable = options => {
  const deferrable = options.deferrable,
    deferred = options.deferred;

  return deferrable
    ? `DEFERRABLE INITIALLY ${deferred ? "DEFERRED" : "IMMEDIATE"}`
    : null;
};

const parseColumns = (tableName, columns, extendingTypeShorthands = {}) => {
  let columnsWithOptions = _lodash2.default.mapValues(columns, column =>
    (0, _utils.applyType)(column, extendingTypeShorthands)
  );

  const primaryColumns = _lodash2.default
    .chain(columnsWithOptions)
    .map((options, columnName) => (options.primaryKey ? columnName : null))
    .filter()
    .value();
  const multiplePrimaryColumns = primaryColumns.length > 1;

  if (multiplePrimaryColumns) {
    columnsWithOptions = _lodash2.default.mapValues(
      columnsWithOptions,
      options =>
        _extends({}, options, {
          primaryKey: false
        })
    );
  }

  const comments = _lodash2.default
    .chain(columnsWithOptions)
    .map(
      (options, columnName) =>
        typeof options.comment !== "undefined" &&
        (0, _utils.comment)(
          "COLUMN",
          `${(0, _utils.schemalize)(tableName)}"."${columnName}`,
          options.comment
        )
    )
    .filter()
    .value();

  return {
    columns: _lodash2.default.map(columnsWithOptions, (options, columnName) => {
      const type = options.type,
        collation = options.collation,
        defaultValue = options.default,
        unique = options.unique,
        primaryKey = options.primaryKey,
        notNull = options.notNull,
        check = options.check,
        references = options.references,
        deferrable = options.deferrable;

      const constraints = [];
      if (collation) {
        constraints.push(`COLLATE ${collation}`);
      }
      if (defaultValue !== undefined) {
        constraints.push(`DEFAULT ${(0, _utils.escapeValue)(defaultValue)}`);
      }
      if (unique) {
        constraints.push("UNIQUE");
      }
      if (primaryKey) {
        constraints.push("PRIMARY KEY");
      }
      if (notNull) {
        constraints.push("NOT NULL");
      }
      if (check) {
        constraints.push(`CHECK (${check})`);
      }
      if (references) {
        constraints.push(parseReferences(options));
      }
      if (deferrable) {
        constraints.push(parseDeferrable(options));
      }

      const constraintsStr = constraints.length
        ? ` ${constraints.join(" ")}`
        : "";

      const sType =
        typeof type === "object" ? `"${(0, _utils.schemalize)(type)}"` : type;

      return _utils.template`"${columnName}" ${sType}${constraintsStr}`;
    }),
    constraints: _extends(
      {},
      multiplePrimaryColumns ? { primaryKey: primaryColumns } : {}
    ),
    comments
  };
};

const parseConstraints = (table, options, genName) => {
  const check = options.check,
    unique = options.unique,
    primaryKey = options.primaryKey,
    foreignKeys = options.foreignKeys,
    exclude = options.exclude,
    deferrable = options.deferrable;

  const tableName = typeof table === "object" ? table.name : table;
  const constraints = [];
  if (check) {
    const name = genName ? `CONSTRAINT "${tableName}_chck" ` : "";
    constraints.push(`${name}CHECK (${check})`);
  }
  if (unique) {
    const uniqueArray = _lodash2.default.isArray(unique) ? unique : [unique];
    const isArrayOfArrays = uniqueArray.some(uniqueSet =>
      _lodash2.default.isArray(uniqueSet)
    );
    (isArrayOfArrays ? uniqueArray : [uniqueArray]).forEach(uniqueSet => {
      const cols = _lodash2.default.isArray(uniqueSet)
        ? uniqueSet
        : [uniqueSet];
      const name = genName
        ? `CONSTRAINT "${tableName}_uniq_${cols.join("_")}" `
        : "";
      constraints.push(`${name}UNIQUE (${(0, _utils.quote)(cols).join(", ")})`);
    });
  }
  if (primaryKey) {
    const name = genName ? `CONSTRAINT "${tableName}_pkey" ` : "";
    const key = (0, _utils.quote)(
      _lodash2.default.isArray(primaryKey) ? primaryKey : [primaryKey]
    ).join(", ");
    constraints.push(`${name}PRIMARY KEY (${key})`);
  }
  if (foreignKeys) {
    (_lodash2.default.isArray(foreignKeys)
      ? foreignKeys
      : [foreignKeys]
    ).forEach(fk => {
      const columns = fk.columns;

      const cols = _lodash2.default.isArray(columns) ? columns : [columns];
      const name = genName
        ? `CONSTRAINT "${tableName}_fk_${cols.join("_")}" `
        : "";
      const key = (0, _utils.quote)(cols).join(", ");
      constraints.push(`${name}FOREIGN KEY (${key}) ${parseReferences(fk)}`);
    });
  }
  if (exclude) {
    const name = genName ? `CONSTRAINT "${tableName}_excl" ` : "";
    constraints.push(`${name}EXCLUDE ${exclude}`);
  }

  return deferrable
    ? constraints.map(constraint => `${constraint} ${parseDeferrable(options)}`)
    : constraints;
};

// TABLE
const dropTable = (exports.dropTable = (
  tableName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`DROP TABLE${ifExistsStr} "${tableName}"${cascadeStr};`;
});

const createTable = (exports.createTable = typeShorthands => {
  const _create = (tableName, columns, options = {}) => {
    const temporary = options.temporary,
      ifNotExists = options.ifNotExists,
      inherits = options.inherits,
      like = options.like;
    var _options$constraints = options.constraints;
    const optionsConstraints =
        _options$constraints === undefined ? {} : _options$constraints,
      tableComment = options.comment;

    var _parseColumns = parseColumns(tableName, columns, typeShorthands);

    const columnLines = _parseColumns.columns,
      columnsConstraints = _parseColumns.constraints;
    var _parseColumns$comment = _parseColumns.comments;
    const columnComments =
      _parseColumns$comment === undefined ? [] : _parseColumns$comment;

    const dupes = _lodash2.default.intersection(
      Object.keys(optionsConstraints),
      Object.keys(columnsConstraints)
    );
    if (dupes.length > 0) {
      const dupesStr = dupes.join(", ");
      throw new Error(
        `There is duplicate constraint definition in table and columns options: ${dupesStr}`
      );
    }

    const constraints = _extends({}, optionsConstraints, columnsConstraints);
    const constraintLines = parseConstraints(tableName, constraints, true);
    const tableDefinition = [...columnLines, ...constraintLines].concat(
      like ? [_utils.template`LIKE "${like}"`] : []
    );

    const temporaryStr = temporary ? " TEMPORARY" : "";
    const ifNotExistsStr = ifNotExists ? " IF NOT EXISTS" : "";
    const inheritsStr = inherits
      ? _utils.template` INHERITS ("${inherits}")`
      : "";

    const createTableQuery = _utils.template`CREATE TABLE${temporaryStr}${ifNotExistsStr} "${tableName}" (
${(0, _utils.formatLines)(tableDefinition)}
)${inheritsStr};`;
    const comments = columnComments;
    if (typeof tableComment !== "undefined") {
      comments.push((0, _utils.comment)("TABLE ", tableName, tableComment));
    }
    return `${createTableQuery}${
      comments.length > 0 ? `\n${comments.join("\n")}` : ""
    }`;
  };
  _create.reverse = dropTable;
  return _create;
});

const alterTable = (exports.alterTable = (tableName, options) => {
  const alterDefinition = [];
  if (options.levelSecurity) {
    alterDefinition.push(`${options.levelSecurity} ROW LEVEL SECURITY`);
  }
  return _utils.template`ALTER TABLE "${tableName}"
${(0, _utils.formatLines)(alterDefinition)};`;
});

// COLUMNS
const dropColumns = (exports.dropColumns = (
  tableName,
  columns,
  { ifExists, cascade } = {}
) => {
  if (typeof columns === "string") {
    columns = [columns]; // eslint-disable-line no-param-reassign
  } else if (
    !_lodash2.default.isArray(columns) &&
    typeof columns === "object"
  ) {
    columns = _lodash2.default.keys(columns); // eslint-disable-line no-param-reassign
  }
  const columnsStr = (0, _utils.formatLines)(
    (0, _utils.quote)(columns),
    `  DROP ${ifExists ? " IF EXISTS" : ""}`,
    `${cascade ? " CASCADE" : ""},`
  );
  return _utils.template`ALTER TABLE "${tableName}"
${columnsStr};`;
});

const addColumns = (exports.addColumns = typeShorthands => {
  const _add = (tableName, columns) => {
    var _parseColumns2 = parseColumns(tableName, columns, typeShorthands);

    const columnLines = _parseColumns2.columns;
    var _parseColumns2$commen = _parseColumns2.comments;
    const columnComments =
      _parseColumns2$commen === undefined ? [] : _parseColumns2$commen;

    const columnsStr = (0, _utils.formatLines)(columnLines, "  ADD ");
    const alterTableQuery = _utils.template`ALTER TABLE "${tableName}"\n${columnsStr};`;
    const columnCommentsStr =
      columnComments.length > 0 ? `\n${columnComments.join("\n")}` : "";
    return `${alterTableQuery}${columnCommentsStr}`;
  };
  _add.reverse = dropColumns;
  return _add;
});

const alterColumn = (exports.alterColumn = (tableName, columnName, options) => {
  const defaultValue = options.default,
    type = options.type,
    collation = options.collation,
    using = options.using,
    notNull = options.notNull,
    allowNull = options.allowNull,
    columnComment = options.comment;

  const actions = [];
  if (defaultValue === null) {
    actions.push("DROP DEFAULT");
  } else if (defaultValue !== undefined) {
    actions.push(`SET DEFAULT ${(0, _utils.escapeValue)(defaultValue)}`);
  }
  if (type) {
    const typeStr = (0, _utils.applyTypeAdapters)(type);
    const collationStr = collation ? `COLLATE ${collation}` : "";
    const usingStr = using ? ` USING ${using}` : "";
    actions.push(`SET DATA TYPE ${typeStr}${collationStr}${usingStr}`);
  }
  if (notNull) {
    actions.push("SET NOT NULL");
  } else if (notNull === false || allowNull) {
    actions.push("DROP NOT NULL");
  }

  const columnsStr = (0, _utils.formatLines)(
    actions,
    `  ALTER "${columnName}" `
  );
  const columnCommentStr =
    typeof columnComment !== "undefined"
      ? `\n${(0, _utils.comment)("TABLE ", columnName, columnComment)}`
      : "";
  return _utils.template`ALTER TABLE "${tableName}"\n${columnsStr};${columnCommentStr}`;
});

const renameTable = (exports.renameTable = (tableName, newName) =>
  _utils.template`ALTER TABLE "${tableName}" RENAME TO "${newName}";`);

const undoRenameTable = (tableName, newName) => renameTable(newName, tableName);

const renameColumn = (exports.renameColumn = (tableName, columnName, newName) =>
  _utils.template`ALTER TABLE "${tableName}" RENAME "${columnName}" TO "${newName}";`);

const undoRenameColumn = (tableName, columnName, newName) =>
  renameColumn(tableName, newName, columnName);

const renameConstraint = (exports.renameConstraint = (
  tableName,
  constraintName,
  newName
) =>
  _utils.template`ALTER TABLE "${tableName}" RENAME CONSTRAINT "${constraintName}" TO "${newName}";`);

const undoRenameConstraint = (tableName, constraintName, newName) =>
  renameConstraint(tableName, newName, constraintName);

const addConstraint = (exports.addConstraint = (
  tableName,
  constraintName,
  expression
) => {
  const constraint = constraintName ? `CONSTRAINT "${constraintName}" ` : "";
  const constraintStr = (0, _utils.formatLines)(
    typeof expression === "string"
      ? [expression]
      : parseConstraints(tableName, expression, false),
    `  ADD ${constraint}`
  );
  return _utils.template`ALTER TABLE "${tableName}"\n${constraintStr};`;
});

const dropConstraint = (exports.dropConstraint = (
  tableName,
  constraintName,
  { ifExists, cascade } = {}
) => {
  const ifExistsStr = ifExists ? " IF EXISTS" : "";
  const cascadeStr = cascade ? " CASCADE" : "";
  return _utils.template`ALTER TABLE "${tableName}" DROP CONSTRAINT${ifExistsStr} "${constraintName}"${cascadeStr};`;
});

addColumns.reverse = dropColumns;
addConstraint.reverse = dropConstraint;
renameColumn.reverse = undoRenameColumn;
renameConstraint.reverse = undoRenameConstraint;
renameTable.reverse = undoRenameTable;
