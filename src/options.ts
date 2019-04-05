import { camelCase, upperFirst, sortBy, keys } from 'lodash'
import { SchemaDefinition, TableDefinition, CustomDefinition, Database } from './schemaInterfaces'
import { PostgresDatabase } from './schemaPostgres'
import * as yargs from 'yargs'
import { generate } from './typescript'

enum SQLVersion {
    POSTGRES = 1,
    MYSQL = 2,
    UNKNOWN = 3
}

export type OptionValues = {
    camelCase: boolean
    connectionString: string
    noHeader: boolean // write schemats description header
    output: string
    schema: string
    table: string | string[]
}

export class Options implements OptionValues {
    camelCase: boolean
    connectionString: string
    noHeader: boolean
    output: string
    schema: string
    table: string[]

    constructor (options: OptionValues) {
        this.camelCase = options.camelCase || false
        this.connectionString = options.connectionString
        this.noHeader = options.noHeader || false
        this.output = options.output
        this.schema = options.schema || 'public'
        this.table = ([] as string[]).concat(options.table || [])
    }

    static fromArgv (): Options {
        const argv: OptionValues = yargs
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
            .argv

        return new Options(argv)
    }

    getSQLVersion (): SQLVersion {
        if (/^postgres(ql)?:\/\//i.test(this.connectionString)) {
            return SQLVersion.POSTGRES
        }
        if (/^mysql:\/\//i.test(this.connectionString)) {
            return SQLVersion.MYSQL
        }
        return SQLVersion.UNKNOWN
    }

    getDatabase (): Database {
        return new PostgresDatabase(this.connectionString)
        // switch (getSQLVersion(connection)) {
        //     case SQLVersion.MYSQL:
        //         return new MysqlDatabase(connection)
        //     case SQLVersion.POSTGRES:
        //         return new PostgresDatabase(connection)
        //     default:
        //         throw new Error(`SQL version unsupported in connection: ${connection}`)
        // }
    }

    async getSchema () {
        const schema = await this.getDatabase().getSchema(this)
        return this.table.length
            ? schema.filter(s => s.type !== 'table' || ~this.table.indexOf(s.name))
            : schema
    }

    async generate () {
        const schema = await this.getSchema()
        return generate(schema, this)
    }

    getTypes<T extends SchemaDefinition> (definitions: SchemaDefinition[], filter: T['type']): T[] {
        const types = definitions.filter(d => d.type === filter) as T[]
        return sortBy(types, t => t.name)
    }

    transformTypeName (typename: string) {
        return this.camelCase ? upperFirst(camelCase(typename)) : typename
    }

    transformColumnName (columnName: string) {
        return this.camelCase ? camelCase(columnName) : columnName
    }
}
