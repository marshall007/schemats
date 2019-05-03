import * as PgPromise from 'pg-promise'
import { groupBy, toPairs, map, values } from 'lodash'
import { Options } from './options'

import { TableDefinition, Database, SchemaDefinition, EnumDefinition, CustomDefinition } from './schemaInterfaces'

const pgp = PgPromise()

interface PgColumnInfo {
    table_name: string
    column_name: string
    udt_name: string
    is_nullable: 'YES' | 'NO'
    column_default: string | null

}

export class PostgresDatabase implements Database {
    private db: PgPromise.IDatabase<{}>

    constructor (public connectionString: string) {
        this.db = pgp(connectionString)
    }

    private static mapTableDefinitionsToType<T extends TableDefinition | CustomDefinition> (definitions: T[], customTypes: string[], options: Options): T[] {
        for (const def of definitions) {
            for (const key of Object.keys(def.columns)) {
                def.columns[key].tsType = this.toTSType(def.columns[key].udtName, customTypes, options)
            }
        }

        return definitions
    }

    private static toTSType (udtName: string, customTypes: string[], options: Options): string {
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
                return 'string'
            case 'int2':
            case 'int4':
            case 'int8':
            case 'float4':
            case 'float8':
            case 'numeric':
            case 'money':
            case 'oid':
                return 'number'
            case 'bool':
                return 'boolean'
            case 'json':
            case 'jsonb':
                return 'Object'
            case 'date':
            case 'timestamp':
            case 'timestamptz':
                return 'Date'
            case 'interval':
                return 'customTypes._pg_interval'
            case '_int2':
            case '_int4':
            case '_int8':
            case '_float4':
            case '_float8':
            case '_numeric':
            case '_money':
                return 'Array<number>'
            case '_bool':
                return 'Array<boolean>'
            case '_varchar':
            case '_text':
            case '_citext':
            case '_uuid':
            case '_bytea':
                return 'Array<string>'
            case '_json':
            case '_jsonb':
                return 'Array<Object>'
            case '_timestamptz':
                return 'Array<Date>'
            default:
                if (customTypes.indexOf(udtName) !== -1) {
                    return `customTypes.${options.transformTypeName(udtName)}`
                }

                console.log(`Type [${udtName} has been mapped to [any] because no specific type has been found.`)
                return 'any'
        }
    }

    public query (queryString: string) {
        return this.db.query(queryString)
    }

    public async getEnumTypes (schemaName?: string): Promise<EnumDefinition[]> {
        const items = await this.db.query<{ name: string, value: any }>(`
             select n.nspname as schema, t.typname as name, e.enumlabel as value
             from pg_type t
             join pg_enum e on t.oid = e.enumtypid
             join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
             where n.nspname = $1
             order by t.typname asc, e.enumlabel asc
        `, [schemaName])

        const groups = groupBy(items, 'name')

        return map(groups, (items, name) => ({
            type: 'enum' as 'enum',
            name,
            values: items.map(i => i.value)
        }))
    }

    public async getUserDefinedTypes (schemaName: string): Promise<CustomDefinition[]> {
        const columns: PgColumnInfo[] = await this.db.query(`
            SELECT udt_name as "table_name", attribute_name as "column_name", attribute_udt_name as "udt_name", is_nullable, attribute_default as "column_default"
            FROM information_schema.attributes
            WHERE udt_schema = $1
            ORDER BY udt_name, ordinal_position
        `, [schemaName])

        return this.toTableDefinitions(columns, 'custom')
    }

    public async getTableTypes (schemaName: string): Promise<TableDefinition[]> {
        const columns: PgColumnInfo[] = await this.db.query(`
            SELECT table_name, column_name, udt_name, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = $1
            ORDER BY table_name, ordinal_position
        `, [schemaName])

        return this.toTableDefinitions(columns, 'table')
    }

    public async getSchema (options: Options): Promise<SchemaDefinition[]> {
        const [ enums, types, tables ] = await Promise.all([
            this.getEnumTypes(options.schema),
            this.getUserDefinedTypes(options.schema),
            this.getTableTypes(options.schema)
        ])

        const customTypes = [ ...enums, ...types ].map(r => r.name)

        return [
            ...enums,
            ...PostgresDatabase.mapTableDefinitionsToType(types, customTypes, options),
            ...PostgresDatabase.mapTableDefinitionsToType(tables, customTypes, options)
        ]
    }

    private toTableDefinitions<T extends TableDefinition | CustomDefinition> (columns: PgColumnInfo[], type: T['type']): T[] {
        const schema: { [key: string]: T } = {}

        for (const column of columns) {
            const table = schema[column.table_name] = schema[column.table_name] || {
                type,
                name: column.table_name,
                columns: {}
            }

            table.columns[column.column_name] = {
                udtName: column.udt_name,
                nullable: column.is_nullable === 'YES',
                hasDefault: column.column_default != null
            }
        }

        return values(schema)
    }
}
