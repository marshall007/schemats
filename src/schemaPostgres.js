"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PgPromise = require("pg-promise");
var lodash_1 = require("lodash");
var pgp = PgPromise();
var PostgresDatabase = /** @class */ (function () {
    function PostgresDatabase(connectionString) {
        this.connectionString = connectionString;
        this.db = pgp(connectionString);
    }
    PostgresDatabase.mapTableDefinitionsToType = function (definitions, customTypes, options) {
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var def = definitions_1[_i];
            for (var _a = 0, _b = Object.keys(def.columns); _a < _b.length; _a++) {
                var key = _b[_a];
                def.columns[key].tsType = this.toTSType(def.columns[key].udtName, customTypes, options);
            }
        }
        return definitions;
    };
    PostgresDatabase.toTSType = function (udtName, customTypes, options) {
        switch (udtName) {
            case 'bpchar':
            case 'char':
            case 'varchar':
            case 'text':
            case 'citext':
            case 'uuid':
            case 'bytea':
            case 'inet':
            case 'time':
            case 'timetz':
            case 'name':
                return 'string';
            case 'int2':
            case 'int4':
            case 'int8':
            case 'float4':
            case 'float8':
            case 'numeric':
            case 'money':
            case 'oid':
                return 'number';
            case 'bool':
                return 'boolean';
            case 'json':
            case 'jsonb':
                return 'Object';
            case 'date':
            case 'timestamp':
            case 'timestamptz':
                return 'Date';
            case 'interval':
                return 'customTypes._pg_interval';
            case '_int2':
            case '_int4':
            case '_int8':
            case '_float4':
            case '_float8':
            case '_numeric':
            case '_money':
                return 'Array<number>';
            case '_bool':
                return 'Array<boolean>';
            case '_varchar':
            case '_text':
            case '_citext':
            case '_uuid':
            case '_bytea':
                return 'Array<string>';
            case '_json':
            case '_jsonb':
                return 'Array<Object>';
            case '_timestamptz':
                return 'Array<Date>';
            default:
                if (customTypes.indexOf(udtName.replace(/^_/, '')) !== -1) {
                    return "customTypes." + options.transformTypeName(udtName.replace(/^_/, '')) + (udtName.indexOf('_') === 0 ? '[]' : '');
                }
                console.log("Type [" + udtName + " has been mapped to [any] because no specific type has been found.");
                return 'any';
        }
    };
    PostgresDatabase.prototype.query = function (queryString) {
        return this.db.query(queryString);
    };
    PostgresDatabase.prototype.getEnumTypes = function (schemaName) {
        return __awaiter(this, void 0, void 0, function () {
            var items, groups;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n             select n.nspname as schema, t.typname as name, e.enumlabel as value\n             from pg_type t\n             join pg_enum e on t.oid = e.enumtypid\n             join pg_catalog.pg_namespace n ON n.oid = t.typnamespace\n             where n.nspname = $1\n             order by t.typname asc, e.enumlabel asc\n        ", [schemaName])];
                    case 1:
                        items = _a.sent();
                        groups = lodash_1.groupBy(items, 'name');
                        return [2 /*return*/, lodash_1.map(groups, function (items, name) { return ({
                                type: 'enum',
                                name: name,
                                values: items.map(function (i) { return i.value; })
                            }); })];
                }
            });
        });
    };
    PostgresDatabase.prototype.getUserDefinedTypes = function (schemaName) {
        return __awaiter(this, void 0, void 0, function () {
            var columns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n            SELECT udt_name as \"table_name\", attribute_name as \"column_name\", attribute_udt_name as \"udt_name\", is_nullable, attribute_default as \"column_default\"\n            FROM information_schema.attributes\n            WHERE udt_schema = $1\n            ORDER BY udt_name, ordinal_position\n        ", [schemaName])];
                    case 1:
                        columns = _a.sent();
                        return [2 /*return*/, this.toTableDefinitions(columns, 'custom')];
                }
            });
        });
    };
    PostgresDatabase.prototype.getTableTypes = function (schemaName) {
        return __awaiter(this, void 0, void 0, function () {
            var columns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("\n            SELECT table_name, column_name, udt_name, is_nullable, column_default\n            FROM information_schema.columns\n            WHERE table_schema = $1\n            ORDER BY table_name, ordinal_position\n        ", [schemaName])];
                    case 1:
                        columns = _a.sent();
                        return [2 /*return*/, this.toTableDefinitions(columns, 'table')];
                }
            });
        });
    };
    PostgresDatabase.prototype.getSchema = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, enums, types, tables, customTypes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getEnumTypes(options.schema),
                            this.getUserDefinedTypes(options.schema),
                            this.getTableTypes(options.schema)
                        ])];
                    case 1:
                        _a = _b.sent(), enums = _a[0], types = _a[1], tables = _a[2];
                        customTypes = enums.concat(types).map(function (r) { return r.name; });
                        return [2 /*return*/, enums.concat(PostgresDatabase.mapTableDefinitionsToType(types, customTypes, options), PostgresDatabase.mapTableDefinitionsToType(tables, customTypes, options))];
                }
            });
        });
    };
    PostgresDatabase.prototype.toTableDefinitions = function (columns, type) {
        var schema = {};
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            var table = schema[column.table_name] = schema[column.table_name] || {
                type: type,
                name: column.table_name,
                columns: {}
            };
            table.columns[column.column_name] = {
                udtName: column.udt_name,
                nullable: column.is_nullable === 'YES',
                hasDefault: column.column_default != null
            };
        }
        return lodash_1.values(schema);
    };
    return PostgresDatabase;
}());
exports.PostgresDatabase = PostgresDatabase;
//# sourceMappingURL=schemaPostgres.js.map