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
var lodash_1 = require("lodash");
var schemaPostgres_1 = require("./schemaPostgres");
var yargs = require("yargs");
var typescript_1 = require("./typescript");
var SQLVersion;
(function (SQLVersion) {
    SQLVersion[SQLVersion["POSTGRES"] = 1] = "POSTGRES";
    SQLVersion[SQLVersion["MYSQL"] = 2] = "MYSQL";
    SQLVersion[SQLVersion["UNKNOWN"] = 3] = "UNKNOWN";
})(SQLVersion || (SQLVersion = {}));
var Options = /** @class */ (function () {
    function Options(options) {
        this.camelCase = options.camelCase || false;
        this.connectionString = options.connectionString;
        this.noHeader = options.noHeader || false;
        this.output = options.output;
        this.schema = options.schema || 'public';
        this.table = [].concat(options.table || []);
        this.db = Options.getDatabase(this.connectionString);
    }
    Options.fromArgv = function () {
        var argv = yargs
            .usage('Usage: $0 <command> [options]')
            .global('config')
            .default('config', 'schemats.json')
            .config()
            .env('SCHEMATS')
            .command('generate', 'generate type definition')
            .demand(1)
            // tslint:disable-next-line
            .example('$0 generate -c postgres://username:password@localhost/db -t table1 -t table2 -s schema -o interface_output.ts', 'generate typescript interfaces from schema')
            .demand('c')
            .alias('c', 'connectionString')
            .nargs('c', 1)
            .describe('c', 'database connection string')
            .alias('t', 'table')
            .nargs('t', 1)
            .describe('t', 'table name')
            .alias('s', 'schema')
            .nargs('s', 1)
            .describe('s', 'schema name')
            .alias('C', 'camelCase')
            .describe('C', 'Camel-case columns')
            .describe('noHeader', 'Do not write header')
            .demand('o')
            .nargs('o', 1)
            .alias('o', 'output')
            .describe('o', 'output file name')
            .help('h')
            .alias('h', 'help')
            .argv;
        return new Options(argv);
    };
    Options.getDatabase = function (connection) {
        return new schemaPostgres_1.PostgresDatabase(connection);
        // switch (Options.getSQLVersion(connection)) {
        //     case SQLVersion.MYSQL:
        //         return new MysqlDatabase(connection)
        //     case SQLVersion.POSTGRES:
        //         return new PostgresDatabase(connection)
        //     default:
        //         throw new Error(`SQL version unsupported in connection: ${connection}`)
        // }
    };
    Options.getSQLVersion = function (connection) {
        if (/^postgres(ql)?:\/\//i.test(connection)) {
            return SQLVersion.POSTGRES;
        }
        if (/^mysql:\/\//i.test(connection)) {
            return SQLVersion.MYSQL;
        }
        return SQLVersion.UNKNOWN;
    };
    Options.prototype.getSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var schema;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.getSchema(this)];
                    case 1:
                        schema = _a.sent();
                        return [2 /*return*/, this.table.length
                                ? schema.filter(function (s) { return s.type !== 'table' || ~_this.table.indexOf(s.name); })
                                : schema];
                }
            });
        });
    };
    Options.prototype.generate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var schema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSchema()];
                    case 1:
                        schema = _a.sent();
                        return [2 /*return*/, typescript_1.generate(schema, this)];
                }
            });
        });
    };
    Options.prototype.getTypes = function (definitions, filter) {
        var types = definitions.filter(function (d) { return d.type === filter; });
        return lodash_1.sortBy(types, function (t) { return t.name; });
    };
    Options.prototype.transformTypeName = function (typename) {
        return this.camelCase ? lodash_1.upperFirst(lodash_1.camelCase(typename)) : typename;
    };
    Options.prototype.transformColumnName = function (columnName) {
        return this.camelCase ? lodash_1.camelCase(columnName) : columnName;
    };
    return Options;
}());
exports.Options = Options;
//# sourceMappingURL=options.js.map