"use strict";
/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var pkgVersion = require('../package.json').version;
function getTime() {
    var padTime = function (value) { return ("0" + value).slice(-2); };
    var time = new Date();
    var yyyy = time.getFullYear();
    var MM = padTime(time.getMonth() + 1);
    var dd = padTime(time.getDate());
    var hh = padTime(time.getHours());
    var mm = padTime(time.getMinutes());
    var ss = padTime(time.getSeconds());
    return yyyy + "-" + MM + "-" + dd + " " + hh + ":" + mm + ":" + ss;
}
function nameIsReservedKeyword(name) {
    var reservedKeywords = [
        'string',
        'number',
        'package'
    ];
    return reservedKeywords.indexOf(name) !== -1;
}
function normalizeName(name, options) {
    if (nameIsReservedKeyword(name)) {
        return name + '_';
    }
    else {
        return name;
    }
}
var HEADER_LINE = '/* tslint:disable */\n';
function buildHeader(options) {
    if (options.noHeader) {
        return HEADER_LINE;
    }
    var commands = process.argv.slice(1).join(' ').replace(/:\/\/.*@/, '://username:password@');
    return "\n        " + HEADER_LINE + "\n\n        /**\n         * AUTO-GENERATED FILE @ " + getTime() + " - DO NOT EDIT!\n         *\n         * This file was automatically generated by schemats v." + pkgVersion + "\n         * $ " + commands + "\n         *\n         */\n\n    ";
}
function generateInterface(table, options) {
    var tableName = options.transformTypeName(table.name);
    var members = Object.keys(table.columns).map(function (key) {
        var column = table.columns[key];
        var allowUndefined = column.hasDefault || column.nullable;
        return "" + options.transformColumnName(key) + (allowUndefined ? '?' : '') + ": " + column.tsType + (column.nullable ? ' | null' : '') + ";";
    });
    return "\n        export interface " + normalizeName(tableName, options) + " {\n        " + members.join('\n') + "\n        }\n    ";
}
exports.generateInterface = generateInterface;
function generate(defs, options) {
    var enumNamespace = options.getTypes(defs, 'enum').map(function (_a) {
        var name = _a.name, values = _a.values;
        return "export type " + options.transformTypeName(name) + " = '" + lodash_1.sortBy(values).join("' | '") + "';\n        export const " + options.transformTypeName(name) + "_all_values = ['" + lodash_1.sortBy(values).join("', '") + "'];";
    });
    var customInterfaces = options.getTypes(defs, 'custom').map(function (table) {
        return generateInterface(table, options);
    });
    var tableInterfaces = options.getTypes(defs, 'table').map(function (table) {
        return generateInterface(table, options);
    });
    return "\n        " + buildHeader(options) + "\n\n        export namespace customTypes {\n\n        /**\n         * PostgreSQL [interval values](https://www.postgresql.org/docs/9.1/datatype-datetime.html#DATATYPE-INTERVAL-INPUT) can be written using the following verbose syntax:\n         *\n         * - `1 year`\n         * - `1 year 0 month 0 day 00:00:00`\n         * - `+1-0 +0 +00:00:00`\n         * - `1 hour 10 minute`\n         * - `01:10:00`\n         *\n         * where quantity is a number (possibly signed); unit is microsecond, millisecond, second, minute, hour, day, week, month, year, decade, century, millennium, or abbreviations or plurals of these units; direction can be ago or empty.\n         *\n         * Quantities of days, hours, minutes, and seconds can be specified without explicit unit markings. For example, '1 12:59:10' is read the same as '1 day 12 hours 59 min 10 sec'. Also, a combination of years and months can be specified with a dash; for example '200-10' is read the same as '200 years 10 months'. (These shorter forms are in fact the only ones allowed by the SQL standard, and are used for output when IntervalStyle is set to sql_standard.)\n         */\n        export type _pg_interval = string;\n\n        " + enumNamespace.join('\n') + "\n\n        " + customInterfaces.join('\n') + "\n        }\n\n        " + tableInterfaces.join('\n') + "\n    ";
}
exports.generate = generate;
//# sourceMappingURL=typescript.js.map